import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pipeline } from '../../types/pipeline';
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

const Home = () => {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [editingPipe, setEditingPipe] = useState<Pipeline | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newPipe, setNewPipe] = useState<Pipeline>({
        id: 0,
        name: '',
        diameter: 0,
        length: 0,
        material: '',
        installDate: '',
        lastMaintenanceDate: ''
    });

    const filteredPipelines = pipelines.filter(pipe => {
        const query = searchQuery.toLowerCase();
        return (
            pipe.name.toLowerCase().includes(query) ||
            pipe.material.toLowerCase().includes(query) ||
            pipe.diameter.toString().includes(query) ||
            pipe.length.toString().includes(query) ||
            pipe.installDate.toLowerCase().includes(query) ||
            pipe.lastMaintenanceDate.toLowerCase().includes(query)
        );
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    useEffect(() => {
        const fetchPipelines = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:5157/api/pipelines', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPipelines(data);
                } else {
                    setError('Не удалось загрузить данные');
                }
            } catch (err) {
                setError('Ошибка сети при загрузке труб');
                console.error(err);
            }
        };

        fetchPipelines();
    }, [navigate]);

    const handleEdit = (pipe: Pipeline) => {
        setEditingPipe(pipe);
    };

    const handleUpdate = async () => {
        if (!editingPipe) return;

        if (editingPipe.installDate && editingPipe.lastMaintenanceDate) {
            if (new Date(editingPipe.lastMaintenanceDate) < new Date(editingPipe.installDate)) {
                setError('Дата последнего ТО не может быть раньше даты установки');
                return;
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Нет токена');
            return;
        }

        const pipeToUpdate: Pipeline = {
            ...editingPipe,
            diameter: Number(editingPipe.diameter),
            length: Number(editingPipe.length)
        };

        try {
            const response = await fetch(`http://localhost:5157/api/pipelines/${pipeToUpdate.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                },
                body: JSON.stringify(pipeToUpdate)
            });

            if (response.ok) {
                setPipelines(pipelines.map(p => p.id === pipeToUpdate.id ? pipeToUpdate : p));
                setEditingPipe(null);
            } else {
                setError('Не удалось обновить трубу');
            }
        } catch (err) {
            setError('Ошибка сети');
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить эту трубу?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Нет токена');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5157/api/pipelines/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                setPipelines(pipelines.filter(pipe => pipe.id !== id));
            } else {
                setError('Не удалось удалить трубу');
            }
        } catch (err) {
            setError('Ошибка сети');
            console.error(err);
        }
    };

    const submitAdd = async () => {
        setError('');

        if (newPipe.installDate && newPipe.lastMaintenanceDate) {
            if (new Date(newPipe.lastMaintenanceDate) < new Date(newPipe.installDate)) {
                setError('Дата последнего ТО не может быть раньше даты установки');
                return;
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Нет токена');
            return;
        }

        const pipeToAdd: Pipeline = {
            ...newPipe,
            diameter: Number(newPipe.diameter),
            length: Number(newPipe.length)
        };

        try {
            const response = await fetch('http://localhost:5157/api/pipelines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                },
                body: JSON.stringify(pipeToAdd)
            });

            if (response.ok) {
                const createdPipe = await response.json();
                setPipelines([...pipelines, createdPipe]);
                setNewPipe({
                    id: 0,
                    name: '',
                    diameter: 0,
                    length: 0,
                    material: '',
                    installDate: '',
                    lastMaintenanceDate: ''
                });
                setIsAddDialogOpen(false);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Не удалось добавить трубу');
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
            
            <style>{`
            input[type="date"]::-webkit-datetime-edit {
                color: transparent;
            }
            input[type="date"]:focus::-webkit-datetime-edit,
            input[type="date"]:not([value=""])::-webkit-datetime-edit {
                color: #000;
            }
         `}</style>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'black' }}>
                    Список труб
                </Typography>
                <Button
                    onClick={handleLogout}
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                >
                    Выйти
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    aria-label="view mode"
                >
                    <ToggleButton value="table">Таблица</ToggleButton>
                    <ToggleButton value="cards">Карточки</ToggleButton>
                </ToggleButtonGroup>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddDialogOpen(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                        }
                    }}
                >
                    Добавить трубу
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
                    <Table sx={{ minWidth: 650 }} aria-label="pipelines table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Id</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Название</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Диаметр</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Длина</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Материал</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Дата установки</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Дата последнего ТО</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPipelines.map((pipe) => (
                                <TableRow
                                    key={pipe.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    hover
                                >
                                    <TableCell>{pipe.id}</TableCell>
                                    <TableCell>{pipe.name}</TableCell>
                                    <TableCell align="right">{pipe.diameter}</TableCell>
                                    <TableCell align="right">{pipe.length}</TableCell>
                                    <TableCell>{pipe.material}</TableCell>
                                    <TableCell>{pipe.installDate ? new Date(pipe.installDate).toLocaleDateString('ru-RU') : '-'}</TableCell>
                                    <TableCell>{pipe.lastMaintenanceDate ? new Date(pipe.lastMaintenanceDate).toLocaleDateString('ru-RU') : '-'}</TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => handleEdit(pipe)} color="primary" size="small">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(pipe.id)} color="error" size="small">
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
                    {filteredPipelines.map((pipe) => (
                        <Card key={pipe.id} sx={{ minWidth: 275, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                    {pipe.name}
                                </Typography>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    ID: {pipe.id}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Диаметр:</strong> {pipe.diameter} мм
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Длина:</strong> {pipe.length} м
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Материал:</strong> {pipe.material}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                    Установлена: {pipe.installDate ? new Date(pipe.installDate).toLocaleDateString('ru-RU') : 'Не указана'}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => handleEdit(pipe)}>
                                    Редактировать
                                </Button>
                                <Button size="small" color="error" onClick={() => handleDelete(pipe.id)}>
                                    Удалить
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}

            
            <Dialog open={!!editingPipe} onClose={() => setEditingPipe(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Редактировать трубу</DialogTitle>
                <DialogContent>
                    {editingPipe && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Название"
                                value={editingPipe.name}
                                onChange={(e) => setEditingPipe({ ...editingPipe, name: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Диаметр (мм)"
                                type="number"
                                value={editingPipe.diameter}
                                onChange={(e) => setEditingPipe({ ...editingPipe, diameter: Number(e.target.value) })}
                                fullWidth
                            />
                            <TextField
                                label="Длина (м)"
                                type="number"
                                value={editingPipe.length}
                                onChange={(e) => setEditingPipe({ ...editingPipe, length: Number(e.target.value) })}
                                fullWidth
                            />
                            <TextField
                                label="Материал"
                                value={editingPipe.material}
                                onChange={(e) => setEditingPipe({ ...editingPipe, material: e.target.value })}
                                fullWidth
                            />
                            
                            
                            <TextField
                                label="Дата установки"
                                type="date"
                                value={editingPipe.installDate ? editingPipe.installDate.split('T')[0] : ''}
                                onChange={(e) => setEditingPipe({ ...editingPipe, installDate: e.target.value })}
                                fullWidth
                                variant="outlined"
                                // @ts-expect-error MUI typing quirk
                                InputLabelProps={{ shrink: true } as any}
                            />
                            <TextField
                                label="Дата последнего ТО"
                                type="date"
                                value={editingPipe.lastMaintenanceDate ? editingPipe.lastMaintenanceDate.split('T')[0] : ''}
                                onChange={(e) => setEditingPipe({ ...editingPipe, lastMaintenanceDate: e.target.value })}
                                fullWidth
                                variant="outlined"
                                // @ts-expect-error MUI typing quirk
                                InputLabelProps={{ shrink: true } as any}
                                inputProps={{
                                    min: editingPipe.installDate ? editingPipe.installDate.split('T')[0] : undefined
                                }}
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingPipe(null)} color="inherit">
                        Отмена
                    </Button>
                    <Button onClick={handleUpdate} color="primary" variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

           
            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Добавить новую трубу</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleAdd}>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Название"
                                value={newPipe.name}
                                onChange={(e) => setNewPipe({ ...newPipe, name: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Диаметр (мм)"
                                type="number"
                                value={newPipe.diameter || ''}
                                onChange={(e) => setNewPipe({ ...newPipe, diameter: Number(e.target.value) })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Длина (м)"
                                type="number"
                                value={newPipe.length || ''}
                                onChange={(e) => setNewPipe({ ...newPipe, length: Number(e.target.value) })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Материал"
                                value={newPipe.material}
                                onChange={(e) => setNewPipe({ ...newPipe, material: e.target.value })}
                                fullWidth
                                required
                            />
                            
                            
                            <TextField
                                label="Дата установки"
                                type="date"
                                value={newPipe.installDate}
                                onChange={(e) => setNewPipe({ ...newPipe, installDate: e.target.value })}
                                fullWidth
                                variant="outlined"
                                // @ts-expect-error MUI typing quirk
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Дата последнего ТО"
                                type="date"
                                value={newPipe.lastMaintenanceDate}
                                onChange={(e) => setNewPipe({ ...newPipe, lastMaintenanceDate: e.target.value })}
                                fullWidth
                                variant="outlined"
                                placeholder=''
                                // @ts-expect-error MUI typing quirk
                                InputLabelProps={{ shrink: true } as any}
                                inputProps={{
                                    min: newPipe.installDate || undefined
                                }}
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

export default Home;