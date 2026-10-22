import type { EncounterState, Combatant, CombatantType } from "../types/encounter"

type Listener = (state: EncounterState) => void

const HP_WOUND_LEVEL_MAX = 3;
const FIVE_TOOLS_IMG_BASE_URL = "https://5e.tools/img";

//BUG: Make InitativeBoard/fiveToolsClient more robust in currently unhandled situations like a new "player" character appearing without having it in the players list. For example: adding an NPC in the DM Screen

export class FiveToolsClient {
  private _listeners: Listener[] = []
  private _playerCharacters: string[] = []
  private _playersData: { [key: string] : string} = {}
  // Images received via "showImage", keyed by monster name. Kept across state payloads,
  // since homebrew monsters' tokens are not always under the default bestiary URL.
  private _imageOverrides: { [key: string] : string} = {}
  private _lastState: EncounterState | null = null
  private _client: PeerVeClient

  constructor(players: any[], token: string) {
    this._client = new PeerVeClient();
    this._connectClient(token);
    this._initPlayersData(players);
  }

  private async _connectClient(token: string) {
    try {
      await this._client.pConnectToServer(
        token,
        (data) => this._handleData(data),
        {
          label: "kaka",
          serialization: "json",
        }
      );
      } catch (e) {
        console.error(e);
      }
  }

  private _initPlayersData(players: any[]) {
    for (const p of players.values()){
      this._playerCharacters.push(p.name);
      this._playersData[p.name] = p.avatarUrl;
    }
  }

  private _handleData(data: any) {
    const type = data?.data?.type;
    if (type === "state") this._updateEncounterData(data);
    else if (type === "showImage") this._updateShownImage(data);
  }

  private _updateShownImage(data: any) {
    const imageHref = data.data.payload?.imageHref;
    if (!imageHref) return;

    let url: string | undefined;
    if (imageHref.type === "internal" && imageHref.path) url = `${FIVE_TOOLS_IMG_BASE_URL}/${imageHref.path}`;
    else if (imageHref.type === "external" && imageHref.url) url = imageHref.url;
    if (!url) return;

    // e.g. "bestiary/AI/Splugoth the Returned.webp" -> "Splugoth the Returned".
    // External URLs (e.g. D&D Beyond) have opaque filenames that won't match any monster.
    const fileName = decodeURIComponent(url.split("/").pop() ?? "");
    const nameFromFile = fileName.replace(/\.[^.]+$/, "");

    const targetName = this._resolveImageTarget(nameFromFile);
    if (!targetName) return;

    this._imageOverrides[targetName] = url;

    if (!this._lastState) return;
    this._emit({
      ...this._lastState,
      combatants: this._lastState.combatants.map(c =>
        c.type === "monster" && c.name === targetName ? { ...c, imageUrl: url } : c
      )
    });
  }

  private _resolveImageTarget(nameFromFile: string): string | undefined {
    const monsters = this._lastState?.combatants.filter(c => c.type === "monster") ?? [];

    if (nameFromFile && monsters.some(c => c.name === nameFromFile)) return nameFromFile;

    if (!this._lastState) return nameFromFile || undefined;

    const imageless = monsters.filter(c => !this._imageOverrides[c.name]);

    const active = imageless.find(c => c.isActive);
    if (active) return active.name;

    if (imageless.length === 1) return imageless[0].name;

    return undefined;
  }

  private _updateEncounterData(data: any){
    let combatants: Combatant[] = [];
    const round = data.data.payload.round;

    for (const [_i, _combatant] of data.data.payload.rows.entries()){
      const combatantType: CombatantType = this._playerCharacters.includes(_combatant.name) ? "player" : "monster";
      const currentHpForVisibility = _combatant.hpCurrent ?? -1;
      const isHpVisible = currentHpForVisibility === -1 ? false : true;  // currentHp could be 0, which would evaluate to false by default
      // hpWoundLevel:
      // 0: Healthy
      // 1: Hurt (more than half hp)
      // 2: Very Hurt (less than half)
      // 3: Dead

      combatants.push({
        id: String(_i),
        name: _combatant.name,
        type: combatantType,
        currentHp: isHpVisible ? _combatant.hpCurrent : HP_WOUND_LEVEL_MAX - _combatant.hpWoundLevel,
        maxHp: isHpVisible ? _combatant.hpMax : HP_WOUND_LEVEL_MAX,
        initiative: _combatant.initiative,
        imageUrl: this._getImageAddress(_combatant.name, combatantType),
        conditions: [],
        isVisible: true,
        isActive: _combatant.isActive
      });
    }

    const state: EncounterState = {
      round: round,
      currentTurnId: "1",
      combatants: combatants
    };

    this._emit(state);
  }

  private _getImageAddress(name: string, type: CombatantType) {
    if (type === "monster") return this._imageOverrides[name] ?? `${FIVE_TOOLS_IMG_BASE_URL}/bestiary/tokens/XMM/${name}.webp`

    if (type === "player") return this._playersData[name]
  }

  onStateUpdate(listener: Listener) {
    this._listeners.push(listener)
  }

  private _emit(state: EncounterState) {
    this._lastState = state
    this._listeners.forEach(l => l(state))
  }
}
