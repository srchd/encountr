import type { EncounterState, Combatant, CombatantType } from "../types/encounter"

type Listener = (state: EncounterState) => void

const HP_WOUND_LEVEL_MAX = 3;

//BUG: Make InitativeBoard/fiveToolsClient more robust in currently unhandled situations like a new "player" character appearing without having it in the players list. For example: adding an NPC in the DM Screen

export class FiveToolsClient {
  private _listeners: Listener[] = []
  private _playerCharacters: string[] = []
  private _playersData: { [key: string] : string} = {}
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
        (data) => this._updateEncounterData(data),
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

  private _updateEncounterData(data: any){
    const combatants: Combatant[] = [];
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
    if (type === "monster") return `https://5e.tools/img/bestiary/tokens/XMM/${name}.webp`

    if (type === "player") return this._playersData[name]
  }

  onStateUpdate(listener: Listener) {
    this._listeners.push(listener)
  }

  private _emit(state: EncounterState) {
    this._listeners.forEach(l => l(state))
  }
}
