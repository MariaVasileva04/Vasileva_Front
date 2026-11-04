import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contractor } from '../../types/contractor';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
 import { API_BASE_URL } from '../../config';

const getStrategyText = (value: number | string): string => {
    if (value === 0 || value === 'Annual') return 'Раз в год';
    if (value === 1 || value === 'Biennial') return 'Раз в два года';
    if (value === 2 || value === 'ConditionBased') return 'По состоянию';
    return String(value);
};

// Преобразование числа в строку стратегии
const numberToStrategy = (num: number): string => {
    if (num === 0) return 'Annual';
    if (num === 1) return 'Biennial';
    if (num === 2) return 'ConditionBased';
    return 'Annual';
};

const Contractors = () => {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [editingContr, setEditingContr] = useState<Contractor | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newContr, setNewContr] = useState<Contractor>({
        id: 0,
        companyName: '',
        strategy: '',
        basePricePerKm: 0,
        rating: 0
    });
   

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchContractors = async () => {
            const token = getToken();
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/contractors`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Преобразуем числовые стратегии в строки
                    const contractsWithStrings = data.map((c: any) => ({
                        ...c,
                        strategy: numberToStrategy(c.strategy)
                    }));
                    setContractors(contractsWithStrings);
                } else {
                    setError('Не удалось загрузить данные');
                }
            } catch (err) {
                setError('Ошибка сети при загрузке исполнителей');
                console.error(err);
            }
        };

        fetchContractors();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const filteredContractors = contractors.filter(contr => {
        const query = searchQuery.toLowerCase();
        const strategyText = (getStrategyText(contr.strategy) || '').toLowerCase();
        return (
            (contr.companyName?.toLowerCase() || '').includes(query) ||
            strategyText.includes(query) ||
            (contr.basePricePerKm?.toString() || '').includes(query) ||
            (contr.rating?.toString() || '').includes(query)
        );
    });

    const handleEdit = (contr: Contractor) => {
        setEditingContr(contr);
    };

    const handleUpdate = async () => {
        if (!editingContr) return;

        const token = getToken();
        if (!token) {
            setError('Нет токена');
            return;
        }

        // Преобразуем строку стратегии в число
        let strategyNumber = 0;
        if (editingContr.strategy === 'Annual') strategyNumber = 0;
        else if (editingContr.strategy === 'Biennial') strategyNumber = 1;
        else if (editingContr.strategy === 'ConditionBased') strategyNumber = 2;
        else strategyNumber = Number(editingContr.strategy);

        const payload = {
            id: editingContr.id,
            companyName: editingContr.companyName,
            strategy: strategyNumber,
            basePricePerKm: Number(editingContr.basePricePerKm),
            rating: Number(editingContr.rating)
        };

        console.log("📦 PUT Payload:", payload);

        try {
            const response = await fetch(`${API_BASE_URL}/contractors/${editingContr.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Сервер может вернуть обновленный объект или просто OK
                let updatedContr;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    updatedContr = await response.json();
                } else {
                    // Если не JSON, берем из редактируемого объекта
                    updatedContr = editingContr;
                }
                
                setContractors(contractors.map(c => c.id === updatedContr.id ? updatedContr : c));
                setEditingContr(null);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ Ошибка обновления:", errorData);
                setError('Не удалось обновить исполнителя');
            }
        } catch (err) {
            setError('Ошибка сети');
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этого исполнителя?')) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/contractors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setContractors(contractors.filter(c => c.id !== id));
            } else {
                setError('Не удалось удалить исполнителя');
            }
        } catch (err) {
            setError('Ошибка сети');
            console.error(err);
        }
    };

    const submitAdd = async () => {
        setError('');

        if (!newContr.strategy) {
            setError('Пожалуйста, выберите стратегию');
            return;
        }

        const token = getToken();
        if (!token) {
            setError('Нет токена');
            return;
        }

        // Преобразуем строку стратегии в число
        let strategyNumber = 0;
        if (newContr.strategy === 'Annual') strategyNumber = 0;
        else if (newContr.strategy === 'Biennial') strategyNumber = 1;
        else if (newContr.strategy === 'ConditionBased') strategyNumber = 2;
        else strategyNumber = Number(newContr.strategy);

        const payload = {
            companyName: newContr.companyName,
            strategy: strategyNumber,
            basePricePerKm: Number(newContr.basePricePerKm),
            rating: Number(newContr.rating)
        };

        console.log("📦 POST Payload:", payload);

        try {
            const response = await fetch(`${API_BASE_URL}/contractors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Сервер может вернуть созданный объект или просто OK
                let createdContr;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    createdContr = await response.json();
                    // Преобразуем стратегию в строку
                    createdContr.strategy = numberToStrategy(createdContr.strategy);
                } else {
                    // Если не JSON, создаем объект из новых данных
                    createdContr = { 
                        ...newContr, 
                        id: Date.now() // Временный ID
                    };
                }
                
                setContractors([...contractors, createdContr]);
                setNewContr({ id: 0, companyName: '', strategy: '', basePricePerKm: 0, rating: 0 });
                setIsAddDialogOpen(false);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ Ошибка добавления:", errorData);
                setError('Не удалось добавить исполнителя');
            }
        } catch (err) {
            setError('Ошибка сети');
            console.error(err);
        }
    };

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitAdd();
    };

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'black' }}>
                    Список исполнителей
                </Typography>
                <Button onClick={handleLogout} variant="outlined" color="error" startIcon={<DeleteIcon />}>
                    Выйти
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)}>
                    <ToggleButton value="table">Таблица</ToggleButton>
                    <ToggleButton value="cards">Карточки</ToggleButton>
                </ToggleButtonGroup>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddDialogOpen(true)}
                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    Добавить исполнителя
                </Button>
            </Box>

            <TextField
                label="Поиск"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
            />

            {error && (
                <Typography color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {error}
                </Typography>
            )}

            {viewMode === 'table' && (
                <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="contractors table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Id</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Название компании</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Стратегия ТО</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Цена за км</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Рейтинг</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredContractors.map((contr) => (
                                <TableRow
                                    key={contr.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    hover
                                >
                                    <TableCell>{contr.id}</TableCell>
                                    <TableCell>{contr.companyName}</TableCell>
                                    <TableCell>{getStrategyText(contr.strategy)}</TableCell>
                                    <TableCell align="right">{contr.basePricePerKm}</TableCell>
                                    <TableCell align="right">{contr.rating}</TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => handleEdit(contr)} color="primary" size="small">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(contr.id)} color="error" size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {viewMode === 'cards' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mt: 2 }}>
                    {filteredContractors.map((contr) => (
                        <Card key={contr.id} sx={{ minWidth: 275, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                    {contr.companyName}
                                </Typography>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    ID: {contr.id}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Стратегия:</strong> {getStrategyText(contr.strategy)}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Цена за км:</strong> {contr.basePricePerKm} руб
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Рейтинг:</strong> {contr.rating}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => handleEdit(contr)}>
                                    Редактировать
                                </Button>
                                <Button size="small" color="error" onClick={() => handleDelete(contr.id)}>
                                    Удалить
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}

            <Dialog open={!!editingContr} onClose={() => setEditingContr(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Редактировать исполнителя</DialogTitle>
                <DialogContent>
                    {editingContr && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Название компании"
                                value={editingContr.companyName}
                                onChange={(e) => setEditingContr({ ...editingContr, companyName: e.target.value })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Стратегия</InputLabel>
                                <Select
                                    value={editingContr.strategy}
                                    onChange={(e) => setEditingContr({ ...editingContr, strategy: e.target.value })}
                                    label="Стратегия"
                                >
                                    <MenuItem value="Annual">Раз в год</MenuItem>
                                    <MenuItem value="Biennial">Раз в два года</MenuItem>
                                    <MenuItem value="ConditionBased">По состоянию</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Цена за км"
                                type="number"
                                value={editingContr.basePricePerKm}
                                onChange={(e) => setEditingContr({ ...editingContr, basePricePerKm: Number(e.target.value) })}
                                fullWidth
                            />
                            <TextField
                                label="Рейтинг"
                                type="number"
                                value={editingContr.rating}
                                onChange={(e) => setEditingContr({ ...editingContr, rating: Number(e.target.value) })}
                                fullWidth
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingContr(null)} color="inherit">
                        Отмена
                    </Button>
                    <Button onClick={handleUpdate} color="primary" variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Добавить нового исполнителя</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleAdd}>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Название компании"
                                value={newContr.companyName}
                                onChange={(e) => setNewContr({ ...newContr, companyName: e.target.value })}
                                fullWidth
                                required
                            />
                            <FormControl fullWidth required>
                                <InputLabel>Стратегия</InputLabel>
                                <Select
                                    value={newContr.strategy}
                                    onChange={(e) => setNewContr({ ...newContr, strategy: e.target.value })}
                                    label="Стратегия"
                                >
                                    <MenuItem value="">
                                        <em>Выберите стратегию</em>
                                    </MenuItem>
                                    <MenuItem value="Annual">Раз в год</MenuItem>
                                    <MenuItem value="Biennial">Раз в два года</MenuItem>
                                    <MenuItem value="ConditionBased">По состоянию</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Цена за км"
                                type="number"
                                value={newContr.basePricePerKm || ''}
                                onChange={(e) => setNewContr({ ...newContr, basePricePerKm: Number(e.target.value) })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Рейтинг"
                                type="number"
                                value={newContr.rating || ''}
                                onChange={(e) => setNewContr({ ...newContr, rating: Number(e.target.value) })}
                                fullWidth
                                required
                            />
                        </Stack>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddDialogOpen(false)} color="inherit">
                        Отмена
                    </Button>
                    <Button onClick={submitAdd} color="primary" variant="contained">
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Contractors;