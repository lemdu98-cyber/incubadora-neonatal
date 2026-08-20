import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { SENSOR_STATUSES, SENSOR_TYPES } from '@/lib/sensor-options';
import { DeviceDetails } from '../devices/[id]/page';
import { SensorDetails } from './[id]/page';
import { SensorForm } from './sensor-form';
import { canCreateSensor, SensorEmpty, SensorError, SensorList } from './page';

const createSensor=vi.fn(),push=vi.fn();
vi.mock('@/lib/api',async original=>({...await original<typeof import('@/lib/api')>(),createSensor:(...args:unknown[])=>createSensor(...args)}));
vi.mock('@/lib/supabase/client',()=>({createClient:()=>({auth:{getSession:vi.fn().mockResolvedValue({data:{session:{access_token:'token'}}})}})}));
vi.mock('next/navigation',()=>({useRouter:()=>({push,replace:vi.fn(),refresh:vi.fn()}),redirect:vi.fn(),notFound:vi.fn()}));

const incubator={id:'00000000-0000-4000-8000-000000000009',code:'INC-001',name:'Incubadora 1',location:'UCIN',status:'AVAILABLE' as const};
const device={id:'00000000-0000-4000-8000-000000000011',hardwareUid:'A4-C1',code:'ESP32-001',deviceType:'ESP32' as const,incubatorId:incubator.id,status:'ACTIVE' as const,firmwareVersion:'1.0.0',lastSeenAt:null,notes:null,createdAt:'2026-08-20T00:00:00Z',updatedAt:'2026-08-20T00:00:00Z',incubator};
const sensor={id:'00000000-0000-4000-8000-000000000012',code:'DHT11-001',sensorType:'DHT11' as const,deviceId:device.id,status:'ACTIVE' as const,channel:'GPIO4',calibrationMetadata:null,notes:null,createdAt:'2026-08-20T00:00:00Z',updatedAt:'2026-08-20T00:00:00Z',device};

describe('Sensors UI',()=>{
  beforeEach(()=>{vi.clearAllMocks();createSensor.mockResolvedValue(sensor)});
  it('exports runtime types and administrative states',()=>{expect(SENSOR_TYPES).toEqual(['DHT11','DHT22','MAX30100','MAX30205','OTHER']);expect(SENSOR_STATUSES).toEqual(['ACTIVE','MAINTENANCE','DISABLED'])});
  it('renders list',()=>{render(<SensorList sensors={[sensor]}/>);expect(screen.getByText('DHT11-001')).toBeInTheDocument();expect(screen.getByText('GPIO4')).toBeInTheDocument()});
  it('renders empty and error',()=>{const{rerender}=render(<SensorEmpty canCreate/>);expect(screen.getByText('No hay sensores registrados.')).toBeInTheDocument();rerender(<SensorError/>);expect(screen.getByRole('alert')).toBeInTheDocument()});
  it.each([['ADMIN',true],['TECHNICIAN',true],['DOCTOR',false],['NURSE',false]])('applies create UX for %s',(role,allowed)=>expect(canCreateSensor({roles:[role]})).toBe(allowed));
  it('renders runtime types and preselects device without calibration field',()=>{render(<SensorForm devices={[device]} initialDeviceId={device.id}/>);expect(screen.getByLabelText('Dispositivo')).toHaveValue(device.id);expect(screen.getByRole('option',{name:'MAX30100 (SpO₂ / FC)'})).toBeInTheDocument();expect(screen.queryByLabelText(/calibración/i)).not.toBeInTheDocument()});
  it('creates normalized sensor',async()=>{render(<SensorForm devices={[device]}/>);fireEvent.change(screen.getByLabelText('Código'),{target:{value:' dht11-001 '}});fireEvent.change(screen.getByLabelText('Dispositivo'),{target:{value:device.id}});fireEvent.click(screen.getByRole('button',{name:'Registrar sensor'}));await waitFor(()=>expect(createSensor).toHaveBeenCalledWith(expect.objectContaining({code:'DHT11-001',deviceId:device.id}),'token'));expect(push).toHaveBeenCalledWith(`/sensors/${sensor.id}`)});
  it('maps duplicate 409',async()=>{createSensor.mockRejectedValue(new ApiError(409));render(<SensorForm devices={[device]}/>);fireEvent.change(screen.getByLabelText('Código'),{target:{value:'DHT11-001'}});fireEvent.change(screen.getByLabelText('Dispositivo'),{target:{value:device.id}});fireEvent.click(screen.getByRole('button',{name:'Registrar sensor'}));expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe')});
  it('renders null calibration metadata',()=>{render(<SensorDetails sensor={sensor}/>);expect(screen.getByText('Sin datos de calibración')).toBeInTheDocument();expect(screen.queryByText('Telemetría')).not.toBeInTheDocument()});
  it('integrates sensors in device detail',()=>{render(<DeviceDetails device={device} sensors={[sensor]} canManageSensors/>);expect(screen.getByRole('heading',{name:'Sensores'})).toBeInTheDocument();expect(screen.getByRole('link',{name:'Registrar sensor'})).toHaveAttribute('href',`/sensors/new?deviceId=${device.id}`)});
});
