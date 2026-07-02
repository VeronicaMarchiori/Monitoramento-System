import { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { apiClient } from '../utils/api';

interface Establishment {
  id: string;
  name: string;
  address: string;
  phone: string;
  responsible: string;
  latitude?: number;
  longitude?: number;
}

export function EstablishmentsManager() {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    responsible: '',
  });

  useEffect(() => {
    loadEstablishments();
  }, []);

  const loadEstablishments = async () => {
    try {
      const { establishments: data } = await apiClient.getEstablishments();
      setEstablishments(data || []);
    } catch (error) {
      console.error('Error loading establishments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { establishment } = await apiClient.createEstablishment(formData);
      setEstablishments([...establishments, establishment]);
      setDialogOpen(false);
      setFormData({ name: '', address: '', phone: '', responsible: '' });
    } catch (error) {
      console.error('Error creating establishment:', error);
    }
  };

  if (loading) {
    return <div>Carregando estabelecimentos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estabelecimentos</h2>
          <p className="text-gray-600">Gerencie os estabelecimentos cadastrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Estabelecimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Estabelecimento</DialogTitle>
              <DialogDescription>Adicione um novo estabelecimento ao sistema.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Estabelecimento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Condomínio Residencial"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, bairro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible">Pessoa de Contato</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  placeholder="Nome do responsável"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Establishments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estabelecimentos...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {establishments.map((establishment) => (
            <div
              key={establishment.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{establishment.name}</h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{establishment.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{establishment.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
