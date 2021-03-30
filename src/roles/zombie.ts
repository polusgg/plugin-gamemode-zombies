import { StartGameScreenData } from "@polusgg/plugin-polusgg-api/src/services/roleManager/roleManagerService";
import { PlayerInstance } from "@nodepolus/framework/src/api/player";
import { GameOverReason, PlayerColor, PlayerRole } from "@nodepolus/framework/src/types/enums";
import { ServiceType } from "@polusgg/plugin-polusgg-api/src/types/enums";
import { BaseRole } from "@polusgg/plugin-polusgg-api/src/baseRole";
import { Services } from "@polusgg/plugin-polusgg-api/src/services";
import { Player } from "@nodepolus/framework/src/player";
import { LobbyInstance } from "@nodepolus/framework/src/api/lobby";
import { BaseManager } from "@polusgg/plugin-polusgg-api/src/baseManager/baseManager";

export class ZombieManager extends BaseManager {
  constructor(lobby: LobbyInstance) {
    super(lobby);

    this.catch("game.ended", event => event.getGame()).execute(event => {
      if (([
        GameOverReason.CrewmateDisconnect,
        GameOverReason.ImpostorsByKill,
        GameOverReason.ImpostorsBySabotage,
      ]).indexOf(event.getReason()) > -1) {
        event.cancel();

        if (event.getReason() == GameOverReason.CrewmateDisconnect) {
          for (let i = 0; i < event.getGame().getLobby().getConnections().length; i++) {
            const connection = event.getGame().getLobby().getConnections()[i];

            Services.get(ServiceType.RoleManager).setEndGameData(connection, {
              title: "Zombie Win",
              color: [0x18, 0x89, 0x35, 0xFF],
              subtitle: "The last crewmate disconnected",
              yourTeam: event.getGame().getLobby().getPlayers(),
              displayQuit: true,
              displayPlayAgain: true,
            });
          }
        }
      }
    });

    this.catch("meeting.started", event => event.getGame()).execute(event => event.cancel());
  }

  getId(): string { return "zombies" }
  getTypeName(): string { return "Zombie" }
}

export class Zombie extends BaseRole {
  protected metadata = {
    name: "Zombie",
    manager: ZombieManager,
  };

  constructor(player: PlayerInstance) {
    super(player);

    const roleManager = Services.get(ServiceType.RoleManager);

    player.revive();
    player.setColor(PlayerColor.Green);
    roleManager.setBaseRole(player as Player, PlayerRole.Impostor);
    player.setTasks(new Set());

    this.catch("player.murdered", event => event.getKiller()).execute(event => {
      setTimeout(() => {
        roleManager.assignRole(event.getPlayer(), Zombie);

        if (player.getLobby().getPlayers().every(p => p.getMeta<BaseRole>("pgg.api.role").getName() === "Zombie")) {
          player.getLobby().getConnections().forEach(connection => {
            Services.get(ServiceType.RoleManager).setEndGameData(connection, {
              title: "Infectious",
              subtitle: "The Zombies managed to ravage the crew",
              color: [0x18, 0x89, 0x35, 0xFF],
              yourTeam: event.getPlayer().getLobby().getPlayers(),
              displayPlayAgain: true,
              displayQuit: true,
            });
          });

          Services.get(ServiceType.RoleManager).endGame(event.getPlayer().getLobby().getGame()!);
        }
      }, 1000);
    });
  }

  getAssignmentScreen(): StartGameScreenData {
    return {
      title: "[188935FF]Zombie[]",
      subtitle: "Infect the crew before they finish their tasks",
      color: [0x18, 0x89, 0x35, 0xFF],
    };
  }

  getManagerType(): typeof ZombieManager {
    return ZombieManager;
  }
}
