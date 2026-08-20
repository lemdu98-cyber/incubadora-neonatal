import { IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  DEVICE_STATUSES,
  DEVICE_TYPES,
  type DeviceStatusValue,
  type DeviceTypeValue,
} from '../interfaces/device.interface';
export class FindDevicesQueryDto {
  @IsOptional() @IsUUID('4') incubatorId?: string;
  @IsOptional() @IsIn(DEVICE_TYPES) deviceType?: DeviceTypeValue;
  @IsOptional() @IsIn(DEVICE_STATUSES) status?: DeviceStatusValue;
}
