import type { EncounterState, Combatant, CombatantType } from "../domain/encounter"
import type { Player } from "../types/player"

type Listener = (state: EncounterState) => void

const HP_WOUND_LEVEL_MAX = 3;

export class FiveToolsClient {
  private _listeners: Listener[] = []
  private _playerCharacters: String[] = []
  private _playersData: { [key: string] : string} = {}
  private _client: PeerVeClient

  constructor(playersJson: Player[]) {
    this._client = new PeerVeClient();
    this._initUI();
    this._initPlayersData(playersJson);
  }

  private _initUI() {
    const btn = document.getElementById("connect-btn") as HTMLButtonElement;
    const input = document.getElementById("token-input") as HTMLInputElement;
    const errorMsg = document.getElementById("error-msg") as HTMLDivElement;

    btn.addEventListener("click", async () => {
      const token = input.value.trim();

      if (!token) {
        errorMsg.textContent = "Please enter a token.";
        return;
      }

      try {
        await this._client.pConnectToServer(
          token,
          (data) => this._updateEncounterData(data),
          {
            label: "kaka",
            serialization: "json",
          }
        );

        // Hide connect screen
        document.getElementById("connect-screen")!.style.display = "none";
        document.getElementById("root")!.style.display = "block";
      } catch (e) {
        errorMsg.textContent = "Connection failed. Invalid token?";
        console.error(e);
      }
    });
  }

  private _initPlayersData(playersJson: Player[]) {
    for (const p of playersJson.values()){
      this._playerCharacters.push(p.name);
      this._playersData[p.name] = p.imageUrl;
    }
  }

  private _updateEncounterData(data: any){
    var combatants: Combatant[] = [];
    var round = data.data.payload.round;

    console.log(data);

    for (const [_i, _combatant] of data.data.payload.rows.entries()){
      const combatantType: CombatantType = this._playerCharacters.includes(_combatant.name) ? "player" : "monster";
      const currentHpForVisibility = _combatant.hpCurrent ?? -1;
      const isHpVisible = currentHpForVisibility == -1 ? false : true;  // currentHp could be 0, which would evaluate to false by default
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
    if (type == "monster") return `https://5e.tools/img/bestiary/tokens/XMM/${name}.webp`

    if (type == "player") return this._playersData[name]
  }

  onStateUpdate(listener: Listener) {
    this._listeners.push(listener)
  }

  private _emit(state: EncounterState) {
    this._listeners.forEach(l => l(state))
  }
}
