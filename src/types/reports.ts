export interface ContractorCost{
    contractorId: number;
    contractorName: string;
    totalSpent: number;
    recordsCount: number
} 

export interface RecordDetails{
    recordId: number;
    pipeline: string;
    contractor: string;
    date: string;
    actualCost: number;
    estimatedCost: number
    notes: string
} 

export interface UrgentRepair{
    pipelineName: string;
    wear: number;
    recommendedContractor: string;
}