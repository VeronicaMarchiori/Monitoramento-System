import { useState } from 'react';
import { UserPlus, Mail, Lock, User, CreditCard, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export function CreateGuardForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    address: '',
    birthDate: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação - apenas cosmético
    toast.success('✅ Vigilante cadastrado com sucesso!', {
      description: 'O novo vigilante já pode acessar o sistema.',
    });
    
    // Limpar formulário
    setFormData({
      name: '',
      email: '',
      password: '',
      cpf: '',
      phone: '',
      address: '',
      birthDate: '',
      emergencyContact: '',
      emergencyPhone: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Cadastrar Novo Funcionário</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="João Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="Rua, número, bairro, cidade - UF"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dados de Acesso */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary-600" />
                Dados de Acesso ao Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vigilante@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Senha Temporária *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    O vigilante deverá alterar a senha no primeiro acesso
                  </p>
                </div>
              </div>
            </div>

            {/* Contato de Emergência */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                Contato de Emergência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Nome do Contato *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="emergencyContact"
                      type="text"
                      placeholder="Nome completo"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">Telefone do Contato *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      style={{ paddingLeft: '3rem' }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    cpf: '',
                    phone: '',
                    address: '',
                    birthDate: '',
                    emergencyContact: '',
                    emergencyPhone: '',
                  });
                }}
              >
                Limpar Formulário
              </Button>
              <Button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Vigilante
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
