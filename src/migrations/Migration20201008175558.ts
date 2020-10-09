import { Migration } from '@mikro-orm/migrations';

export class Migration20201008175558 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "username" text not null, "password" text not null, "created_at" text not null, "updated_at" text not null);');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

}