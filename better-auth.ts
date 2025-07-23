import * as utils from "@strootje/better-kysely/migrations";
import type { Migration } from "kysely";

export const betterAuth: (...plugins: Array<"admin" | "passkey">) => Record<string, Migration> = utils.build({
  core: {
    better_auth_1_2_9_core: {
      version: "1.2.9",

      async up({ schema }) {
        await schema.createTable("user")
          .addColumn("id", "text", (p) => p.primaryKey())
          .addColumn("name", "text", (p) => p.notNull())
          .addColumn("email", "text", (p) => p.notNull())
          .addColumn("emailVerified", "boolean", (p) => p.notNull())
          .addColumn("image", "text")
          .addColumn("createdAt", "datetime", (p) => p.notNull())
          .addColumn("updatedAt", "datetime", (p) => p.notNull())
          .execute();

        await schema.createIndex("idx_user_email").on("user")
          .columns(["email"])
          .execute();

        await schema.createTable("session")
          .addColumn("id", "text", (p) => p.primaryKey())
          .addColumn("userId", "text", (p) => p.references("user.id").notNull())
          .addColumn("token", "text", (p) => p.notNull())
          .addColumn("expiresAt", "datetime", (p) => p.notNull())
          .addColumn("ipAddress", "text")
          .addColumn("userAgent", "text")
          .addColumn("createdAt", "datetime", (p) => p.notNull())
          .addColumn("updatedAt", "datetime", (p) => p.notNull())
          .execute();

        await schema.createIndex("idx_session_userId_token").on("session")
          .columns(["userId", "token"])
          .execute();

        await schema.createTable("account")
          .addColumn("id", "text", (p) => p.primaryKey())
          .addColumn("userId", "text", (p) => p.references("user.id").notNull())
          .addColumn("accountId", "text", (p) => p.notNull())
          .addColumn("providerId", "text", (p) => p.notNull())
          .addColumn("accessToken", "text")
          .addColumn("refreshToken", "text")
          .addColumn("accessTokenExpiresAt", "datetime")
          .addColumn("refreshTokenExpiresAt", "datetime")
          .addColumn("scope", "text")
          .addColumn("idToken", "text")
          .addColumn("password", "text")
          .addColumn("createdAt", "datetime", (p) => p.notNull())
          .addColumn("updatedAt", "datetime", (p) => p.notNull())
          .execute();

        await schema.createIndex("idx_account_userId").on("account")
          .columns(["userId"])
          .execute();

        await schema.createTable("verification")
          .addColumn("id", "text", (p) => p.primaryKey())
          .addColumn("identifier", "text", (p) => p.notNull())
          .addColumn("value", "text", (p) => p.notNull())
          .addColumn("expiresAt", "datetime", (p) => p.notNull())
          .addColumn("createdAt", "datetime", (p) => p.notNull())
          .addColumn("updatedAt", "datetime", (p) => p.notNull())
          .execute();

        await schema.createIndex("idx_verification_identifier").on("verification")
          .columns(["identifier"])
          .execute();
      },

      async down({ schema }) {
        await schema.dropIndex("idx_verification_identifier").execute();
        await schema.dropIndex("idx_account_userId").execute();
        await schema.dropIndex("idx_session_userId_token").execute();
        await schema.dropIndex("idx_user_email").execute();
        await schema.dropTable("verification").execute();
        await schema.dropTable("account").execute();
        await schema.dropTable("session").execute();
        await schema.dropTable("user").execute();
      },
    },
  },

  admin: {
    better_auth_1_2_9_admin: {
      version: "1.2.9",

      async up({ schema }) {
        await schema.alterTable("user").addColumn("role", "text").execute();
        await schema.alterTable("user").addColumn("banned", "boolean").execute();
        await schema.alterTable("user").addColumn("banReason", "text").execute();
        await schema.alterTable("user").addColumn("banExpires", "datetime").execute();
        await schema.alterTable("session").addColumn("impersonatedBy", "text").execute();
      },

      async down({ schema }) {
        await schema.alterTable("session").dropColumn("impersonatedBy").execute();
        await schema.alterTable("user").dropColumn("role").execute();
        await schema.alterTable("user").dropColumn("banned").execute();
        await schema.alterTable("user").dropColumn("banReason").execute();
        await schema.alterTable("user").dropColumn("banExpires").execute();
      },
    },
  },

  passkey: {
    better_auth_1_2_9_passkey: {
      version: "1.2.9",

      async up({ schema }) {
        await schema.createTable("passkey")
          .addColumn("id", "text", (p) => p.primaryKey())
          .addColumn("name", "text")
          .addColumn("publicKey", "text", (p) => p.notNull())
          .addColumn("userId", "text", (p) => p.references("user.id").notNull())
          .addColumn("credentialID", "text", (p) => p.notNull())
          .addColumn("counter", "integer", (p) => p.notNull())
          .addColumn("deviceType", "text", (p) => p.notNull())
          .addColumn("backedUp", "boolean", (p) => p.notNull())
          .addColumn("transports", "text", (p) => p.notNull())
          .addColumn("createdAt", "datetime", (p) => p.notNull())
          .execute();

        await schema.createIndex("idx_passkey_userId").on("passkey")
          .columns(["userId"])
          .execute();
      },

      async down({ schema }) {
        await schema.dropIndex("idx_passkey_userId").execute();
        await schema.dropTable("passkey").execute();
      },
    },
  },
});
