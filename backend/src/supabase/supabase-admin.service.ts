import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseAdminConflictError,
  SupabaseAdminUnavailableError,
} from './errors/supabase-admin.errors';
import type {
  AdminUser,
  CreateAdminUserInput,
} from './interfaces/admin-user.interface';

@Injectable()
export class SupabaseAdminService {
  private readonly client: SupabaseClient;

  constructor(configService: ConfigService) {
    const client: unknown = createClient(
      configService.getOrThrow<string>('SUPABASE_URL'),
      configService.getOrThrow<string>('SUPABASE_SECRET_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
    this.client = client as SupabaseClient;
  }

  async createUser(input: CreateAdminUserInput): Promise<AdminUser> {
    const { data, error } = await this.client.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        first_name: input.firstName,
        last_name: input.lastName,
      },
    });

    if (error) {
      if (
        error.code === 'email_exists' ||
        error.code === 'user_already_exists'
      ) {
        throw new SupabaseAdminConflictError();
      }
      throw new SupabaseAdminUnavailableError();
    }

    if (!data.user.email) {
      throw new SupabaseAdminUnavailableError();
    }

    return { id: data.user.id, email: data.user.email };
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.client.auth.admin.deleteUser(userId);
    if (error) {
      throw new SupabaseAdminUnavailableError();
    }
  }

  async getUserEmail(userId: string): Promise<string | null> {
    const { data, error } = await this.client.auth.admin.getUserById(userId);
    if (error) {
      if (error.code === 'user_not_found') {
        return null;
      }
      throw new SupabaseAdminUnavailableError();
    }

    return data.user.email ?? null;
  }
}
