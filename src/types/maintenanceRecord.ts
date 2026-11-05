import type {Pipeline} from './pipeline';
import type {Contractor} from './contractor';

export interface MaintenanceRecord{
    id: number;
    pipelineId: number;

    pipeline? : Pipeline | null;

    contractorId: number;

    contractor? : Contractor | null;

    date: string;

    actualCost: number;

    notes: string;

}

export interface CreateMaintenanceRecord{
    id: number;
    pipelineId: number;
    contractorId: number;
    date: string;
    actualCost: number;
    notes: string;
}