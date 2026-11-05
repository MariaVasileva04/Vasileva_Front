import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MaintenanceRecord, CreateMaintenanceRecord } from '../../types/maintenanceRecord';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import { API_BASE_URL } from '../../config';

type PipelineRef = { id: number; name: string; length: number; installDate: string; lastMaintenanceDate?: string };
type ContractorRef = { id: number; companyName: string; basePricePerKm: number };

const MaintenanceRecords = () => {
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [pipelines, setPipelines] = useState<PipelineRef[]>([]);
    const [contractors, setContractors] = useState<ContractorRef[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    
    const [newRecord, setNewRecord] = useState<CreateMaintenanceRecord>({
        id: 0,
        pipelineId: 0,
        contractorId: 0,
        date: '',
        actualCost: 0,
        notes: ''
    });

    const token = localStorage.getItem('token');
    const [sortField, setSortField] = useState<string>('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); 
    
    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const [recordsRes, pipesRes, contrsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/MaintenanceRecords`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/Pipelines`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/Contractors`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (recordsRes.ok) setMaintenanceRecords(await recordsRes.json());
                if (pipesRes.ok) setPipelines(await pipesRes.json());
                if (contrsRes.ok) setContractors(await contrsRes.json());
                
            } catch (err) {
                setError('Ошибка при загрузке данных');
                console.error(err);
            }
        };

        fetchData();
    }, [navigate, token]);

   
    const filteredRecords = maintenanceRecords.filter(mr => {
        const query = searchQuery.toLowerCase();
        const formattedDate = mr.date ? new Date(mr.date).toLocaleDateString('ru-RU') : '';
        const pipeName = mr.pipeline?.name?.toLowerCase() || '';
        const contrName = mr.contractor?.companyName?.toLowerCase() || '';
        
        return (
            mr.id.toString().includes(query) ||
            mr.pipelineId.toString().includes(query) ||
            pipeName.includes(query) ||
            mr.contractorId.toString().includes(query) ||
            contrName.includes(query) ||
            formattedDate.includes(query) ||
            (mr.notes?.toLowerCase() || '').includes(query)
        );
    });

    const sortedReports = [...filteredRecords].sort((a, b) => {
        let valueA: any = a[sortField as keyof MaintenanceRecord];
        let valueB: any = b[sortField as keyof MaintenanceRecord];
    
    
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
        const handleSort = (field: string) => {
        if (sortField === field) {
            
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
           
            setSortField(field);
            setSortDirection('asc');
        }
        };

    
    const handleNewRecordChange = (field: keyof CreateMaintenanceRecord, value: any) => {
        const updatedRecord = { ...newRecord, [field]: value };

        if (field === 'pipelineId' || field === 'contractorId') {
            const pipeline = pipelines.find(p => p.id === updatedRecord.pipelineId);
            const contractor = contractors.find(c => c.id === updatedRecord.contractorId);

            if (pipeline && contractor) {
                updatedRecord.actualCost = Number((pipeline.length * contractor.basePricePerKm).toFixed(2));
            } else {
                updatedRecord.actualCost = 0;
            }
        }

        setNewRecord(updatedRecord);
    };

   
    const submitAdd = async () => {
        setError('');
        if (!token) {
            setError('Нет токена');
            return;
        }

        
        const selectedPipeline = pipelines.find(p => p.id === newRecord.pipelineId);
        if (selectedPipeline && newRecord.date) {
            const installDateStr = new Date(selectedPipeline.installDate).toISOString().split('T')[0];
            
            if (newRecord.date < installDateStr) {
                setError(`Ошибка: Дата ТО (${newRecord.date}) не может быть раньше даты установки трубы (${installDateStr})`);
                return;
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/MaintenanceRecords`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newRecord)
            });

            if (response.ok) {
                const createdRecord = await response.json();

               
                const pipeline = pipelines.find(p => p.id === createdRecord.pipelineId);
                const contractor = contractors.find(c => c.id === createdRecord.contractorId);
                
                const recordWithDetails = {
                    ...createdRecord,
                    pipeline: pipeline ? { name: pipeline.name } : undefined,
                    contractor: contractor ? { companyName: contractor.companyName } : undefined
                };

                const pipelineToUpdate = pipelines.find(p => p.id === createdRecord.pipelineId);
                if (pipelineToUpdate) {
                    const newDate = new Date(createdRecord.date);
                    const lastDate = pipelineToUpdate.lastMaintenanceDate ? new Date(pipelineToUpdate.lastMaintenanceDate) : null;

                    if (!lastDate || newDate > lastDate) {
                        const updatedPipeline = { ...pipelineToUpdate, lastMaintenanceDate: createdRecord.date };
                        
                        await fetch(`${API_BASE_URL}/Pipelines/${updatedPipeline.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify(updatedPipeline)
                        });

                        setPipelines(pipes => pipes.map(p => p.id === updatedPipeline.id ? updatedPipeline : p));
                    }
                }

                
                setMaintenanceRecords(prev => [...prev, recordWithDetails]);
                setNewRecord({ id: 0, pipelineId: 0, contractorId: 0, date: '', actualCost: 0, notes: '' });
                setIsAddDialogOpen(false);
            
            } else {
                setError('Не удалось добавить запись');
            }
        } catch (err) {
            setError('Ошибка сети');
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/MaintenanceRecords/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMaintenanceRecords(prev => prev.filter(mr => mr.id !== id));
            } else {
                setError('Не удалось удалить запись');
            }
        } catch (err) {
            setError('Ошибка сети');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const selectedPipeline = pipelines.find(p => p.id === newRecord.pipelineId);

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant='h4' component="h2" sx={{ fontWeight: 'bold', color: 'black' }}>
                    Список отчетов о ТО
                </Typography>
                
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)}>
                    <ToggleButton value='table'>Таблица</ToggleButton>
                    <ToggleButton value='cards'>Карточки</ToggleButton>
                </ToggleButtonGroup>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddDialogOpen(true)}
                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    Добавить запись о ТО
                </Button>
            </Box>

            <TextField label="Поиск" variant="outlined" fullWidth value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 3 }} />

            {error && <Typography color="error" sx={{ mb: 2, fontWeight: 'bold' }}>{error}</Typography>}

            
            {viewMode === 'table' && (
                <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}onClick={() => handleSort('id')}>Id {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}onClick={() => handleSort('name')}>Труба {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}onClick={() => handleSort('companyName')}>Исполнитель{sortField === 'companyName' && (sortDirection === 'asc' ? '↑' : '↓')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}onClick={() => handleSort('date')}>Дата{sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right" onClick={() => handleSort('actualCost')}>Цена{sortField === 'actualCost' && (sortDirection === 'asc' ? '↑' : '↓')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Заметки</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedReports.map((mr) => (
                                <TableRow key={mr.id} hover>
                                    <TableCell>{mr.id}</TableCell>
                                    <TableCell>{mr.pipeline?.name || `ID: ${mr.pipelineId}`}</TableCell>
                                    <TableCell>{mr.contractor?.companyName || `ID: ${mr.contractorId}`}</TableCell>
                                    <TableCell>{mr.date ? new Date(mr.date).toLocaleDateString('ru-RU') : ''}</TableCell>
                                    <TableCell align="right">{mr.actualCost} ₽</TableCell>
                                    <TableCell>{mr.notes}</TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => setEditingRecord(mr)} color="primary" size="small"><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleDelete(mr.id)} color="error" size="small"><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {viewMode === 'cards' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mt: 2 }}>
                    {sortedReports.map((mr) => (
                        <Card key={mr.id} sx={{ boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Запись #{mr.id}</Typography>
                                <Typography color="text.secondary">Труба: {mr.pipeline?.name || mr.pipelineId}</Typography>
                                <Typography color="text.secondary">Исполнитель: {mr.contractor?.companyName || mr.contractorId}</Typography>
                                <Typography color="text.secondary">Дата: {mr.date ? new Date(mr.date).toLocaleDateString('ru-RU') : ''}</Typography>
                                <Typography color="text.secondary">Цена: {mr.actualCost} ₽</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => setEditingRecord(mr)}>Редактировать</Button>
                                <Button size="small" color="error" onClick={() => handleDelete(mr.id)}>Удалить</Button>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}

            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Добавить запись о ТО</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            select
                            label="Выберите трубу"
                            value={newRecord.pipelineId || ''}
                            onChange={(e) => handleNewRecordChange('pipelineId', Number(e.target.value))}
                            fullWidth
                            required
                            slotProps={{ select: { native: true } }}
                        >
                            <option value={0}>Выберите трубу</option>
                            {pipelines.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Длина: {p.length} км)</option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Выберите исполнителя"
                            value={newRecord.contractorId || ''}
                            onChange={(e) => handleNewRecordChange('contractorId', Number(e.target.value))}
                            fullWidth
                            required
                            slotProps={{ select: { native: true } }}
                        >
                            <option value={0}>Выберите исполнителя</option>
                            {contractors.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName} (Цена: {c.basePricePerKm} ₽/км)</option>
                            ))}
                        </TextField>

                        <TextField
                            label="Дата проведения ТО"
                            type="date"
                            value={newRecord.date}
                            onChange={(e) => handleNewRecordChange('date', e.target.value)}
                            fullWidth
                            required
                            slotProps={{ 
                                inputLabel: { shrink: true },
                                htmlInput: {
                                    min: selectedPipeline 
                                        ? new Date(selectedPipeline.installDate).toISOString().split('T')[0] 
                                        : undefined
                                }
                            }}
                        />

                        <TextField
                            label="Итоговая цена"
                            type="number"
                            value={newRecord.actualCost || ''}
                            slotProps={{ input: { readOnly: true } }}
                            fullWidth
                            sx={{ backgroundColor: '#f0f0f0' }}
                        />

                        <TextField
                            label="Заметки"
                            value={newRecord.notes}
                            onChange={(e) => handleNewRecordChange('notes', e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddDialogOpen(false)} color="inherit">Отмена</Button>
                    <Button onClick={submitAdd} color="primary" variant="contained">Добавить</Button>
                </DialogActions>
            </Dialog>

            
            <Dialog open={!!editingRecord} onClose={() => setEditingRecord(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Редактировать запись о ТО</DialogTitle>
                <DialogContent>
                    {editingRecord && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField label="Id" value={editingRecord.id} disabled fullWidth />
                            <TextField
                                label="Id трубы"
                                type="number"
                                value={editingRecord.pipelineId}
                                onChange={(e) => setEditingRecord({ ...editingRecord, pipelineId: Number(e.target.value) })}
                                fullWidth
                            />
                            <TextField
                                label="Id исполнителя"
                                type="number"
                                value={editingRecord.contractorId}
                                onChange={(e) => setEditingRecord({ ...editingRecord, contractorId: Number(e.target.value) })}
                                fullWidth
                            />
                            <TextField
                                label="Дата"
                                type="date"
                                value={editingRecord.date ? editingRecord.date.split('T')[0] : ''}
                                onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <TextField
                                label="Итоговая цена"
                                type="number"
                                value={editingRecord.actualCost}
                                onChange={(e) => setEditingRecord({ ...editingRecord, actualCost: Number(e.target.value) })}
                                fullWidth
                            />
                            <TextField
                                label="Заметки"
                                value={editingRecord.notes}
                                onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingRecord(null)} color="inherit">Отмена</Button>
                    <Button onClick={async () => {
                        if (!editingRecord || !token) return;
                        try {
                            const res = await fetch(`${API_BASE_URL}/MaintenanceRecords/${editingRecord.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify(editingRecord)
                            });
                            if (res.ok) {
                                setMaintenanceRecords(prev => prev.map(r => r.id === editingRecord.id ? editingRecord : r));
                                setEditingRecord(null);
                            } else {
                                setError('Не удалось обновить');
                            }
                        } catch (err) {
                            setError('Ошибка сети');
                        }
                    }} color="primary" variant="contained">Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MaintenanceRecords;