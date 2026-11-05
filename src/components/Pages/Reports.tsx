import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {type  UrgentRepair, type ContractorCost, type RecordDetails } from '../../types/reports';
import { API_BASE_URL } from '../../config';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


const Reports = () => {
    const navigate = useNavigate();
    const [urgentRepairs, setUrgentRepairs] = useState<UrgentRepair[]>([]);
    const [contractorCost, setContractorCost] = useState<ContractorCost[]>([]);
    const [recordDetails, setRecordsDetails] = useState<RecordDetails[]>([]);
    const[error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    

useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchReports = async () => {
            try {
                const [urgentRes, costsRes, detailsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/Reports/urgent-repairs`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/Reports/contractor-costs`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/Reports/all-records-details`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (urgentRes.ok) {
                    const data = await urgentRes.json();
                    setUrgentRepairs(data);
                }

                if (costsRes.ok) {
                    const data = await costsRes.json();
                    setContractorCost(data);
                }

                if (detailsRes.ok) {
                    const data = await detailsRes.json();
                    setRecordsDetails(data);
                }

            } catch (err) {
                setError('Ошибка при загрузке отчетов');
                console.error(err);
            }
        };

        fetchReports();
    }, [navigate]);

    if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
    }

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <h1>Отчеты</h1>
        
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Срочные ремонты" />
                <Tab label="Расходы по подрядчикам" />
                <Tab label="Детали записей" />
            </Tabs>
        </Box>

        
        {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Название трубы</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Износ (%)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Рекомендуемый подрядчик</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {urgentRepairs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'green', fontWeight: 'bold' }}>
                                Срочных ремонтов не требуется 
                            </TableCell>
                        </TableRow>
                    ) : (
                        urgentRepairs.map((repair, index) => (
                            <TableRow key={index} hover>
                                <TableCell>{repair.pipelineName}</TableCell>
                                <TableCell align="center" sx={{ 
                                    color: repair.wear > 80 ? 'error.main' : 'warning.main', 
                                    fontWeight: 'bold' 
                                }}>
                                    {repair.wear}%
                                </TableCell>
                                <TableCell>{repair.recommendedContractor}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )}

        {activeTab === 1 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Подрядчик</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Количество записей</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Общая сумма расходов</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {contractorCost.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                Нет данных о расходах
                            </TableCell>
                        </TableRow>
                    ) : (
                        contractorCost.map((cost, index) => (
                            <TableRow key={cost.contractorId || index} hover>
                                <TableCell>{cost.contractorName}</TableCell>
                                <TableCell align="center">{cost.recordsCount}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {cost.totalSpent.toLocaleString('ru-RU')} ₽
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )}
        {activeTab === 2 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Труба</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Подрядчик</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Плановая стоимость</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Фактическая стоимость</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Заметки</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recordDetails.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Нет данных о записях
                                </TableCell>
                            </TableRow>
                        ) : (
                            recordDetails.map((record) => (
                                <TableRow key={record.recordId} hover>
                                    <TableCell>{record.recordId}</TableCell>
                                    <TableCell>{record.pipeline}</TableCell>
                                    <TableCell>{record.contractor}</TableCell>
                                    <TableCell>
                                        {record.date ? new Date(record.date).toLocaleDateString('ru-RU') : '—'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                                        {record.estimatedCost.toLocaleString('ru-RU')} ₽
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        {record.actualCost.toLocaleString('ru-RU')} ₽
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {record.notes || '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
    </Box>
    );
};

export default Reports;