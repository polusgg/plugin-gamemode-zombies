import { LobbyInstance } from "@nodepolus/framework/src/api/lobby";
import { BaseMod } from "@polusgg/plugin-polusgg-api/src/baseMod/baseMod";
import { Impostor } from "@polusgg/plugin-polusgg-api/src/baseRole/impostor/impostor";
import { RoleAssignmentData } from "@polusgg/plugin-polusgg-api/src/services/roleManager/roleManagerService";
import { Zombie } from "./src/roles/zombie";

export default class ZombiesMod extends BaseMod {
  constructor() {
    super({
      name: "Zombies",
      version: [1, 0, 0],
    });
  }

  getRoles(_lobby: LobbyInstance): RoleAssignmentData[] {
    return [{
      role: Zombie,
      playerCount: 1,
    }, {
      role: Impostor,
      playerCount: 0,
    }];
  }

  getEnabled(): boolean {
    return true;
  }
}
