import { ICommand } from "./ICommand";
import { MigrateCommand } from "./migrate/MigrateCommand";

export const commands: ICommand[] = [new MigrateCommand()];
