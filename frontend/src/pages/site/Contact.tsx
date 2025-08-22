import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

const eventTypes = [
  { value: "casamento", label: "Casamento" },
  { value: "aniversario", label: "Aniversário" },
  { value: "mesversario", label: "Mesversário" },
  { value: "gestante", label: "Gestante" },
  { value: "formatura", label: "Formatura" },
  { value: "debutante", label: "Debutante" },
  { value: "retrato", label: "Retrato/Book" },
  { value: "evento-corporativo", label: "Evento Corporativo" },
  { value: "outro", label: "Outro" },
];

const origemOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'outros', label: 'Outros' },
];

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipoEvento: "",
    mensagem: "",
    origem: "",
    hp: "", // honeypot
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleInputChange("telefone", formatted);
  };

  const isFormValid = () => {
    return formData.nome && 
           formData.email && 
           formData.telefone && 
           formData.tipoEvento &&
           formData.email.includes("@");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || submitting) return;
    setSubmitting(true);

    try {
      await apiRequest(`/public/leads`, {
        method: 'POST',
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          tipoEvento: formData.tipoEvento,
          mensagem: formData.mensagem || undefined,
          origem: formData.origem || undefined,
          hp: formData.hp || undefined,
        })
      });

    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve. Obrigado!",
    });

    setFormData({
      nome: "",
      email: "",
      telefone: "",
      tipoEvento: "",
      mensagem: "",
      origem: "",
        hp: "",
      });
    } catch (err: any) {
      toast({
        title: "Não foi possível enviar",
        description: err?.message || 'Tente novamente em alguns minutos.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const message = `Olá! Gostaria de solicitar um orçamento para ${formData.tipoEvento || "um evento"}. 
    
Meus dados:
Nome: ${formData.nome || "[Nome]"}
Email: ${formData.email || "[Email]"}
Telefone: ${formData.telefone || "[Telefone]"}
Origem: ${formData.origem || "[Origem]"}

${formData.mensagem ? `Detalhes: ${formData.mensagem}` : ""}

Aguardo retorno!`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = "5511999999999"; // Replace with actual number
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Entre em Contato
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vamos conversar sobre o seu projeto! Preencha o formulário abaixo ou 
            fale conosco diretamente pelo WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-photography-gold" />
                    <div>
                      <p className="font-medium text-foreground">(11) 99999-9999</p>
                      <p className="text-sm text-muted-foreground">Segunda à Sexta, 9h às 18h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-photography-gold" />
                    <div>
                      <p className="font-medium text-foreground">contato@oliverestudios.com</p>
                      <p className="text-sm text-muted-foreground">Resposta em até 24h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-photography-gold" />
                    <div>
                      <p className="font-medium text-foreground">São Paulo, SP</p>
                      <p className="text-sm text-muted-foreground">Atendemos toda a região</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Horário de Funcionamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Segunda - Sexta</span>
                    <span className="font-medium">9h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sábado</span>
                    <span className="font-medium">9h às 15h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domingo</span>
                    <span className="font-medium">Fechado</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Orçamento</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo e entraremos em contato para um orçamento personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tipoEvento">Tipo de Evento *</Label>
                      <Select onValueChange={(value) => handleInputChange("tipoEvento", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de evento" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origem">Como nos conheceu (opcional)</Label>
                      <Select onValueChange={(value) => handleInputChange("origem", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {origemOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem (Opcional)</Label>
                    <Textarea
                      id="mensagem"
                      value={formData.mensagem}
                      onChange={(e) => handleInputChange("mensagem", e.target.value)}
                      placeholder="Conte-nos mais sobre o seu evento, data, local, expectativas..."
                      rows={4}
                    />
                  </div>

                  {/* Honeypot invisível */}
                  <div className="hidden" aria-hidden="true">
                    <Input
                      tabIndex={-1}
                      autoComplete="off"
                      id="hp"
                      value={formData.hp}
                      onChange={(e) => handleInputChange("hp", e.target.value)}
                      placeholder="não preencha"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="submit" 
                      variant="elegant" 
                      className="flex-1"
                      disabled={!isFormValid() || submitting}
                    >
                      Enviar Solicitação
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="whatsapp"
                      onClick={handleWhatsAppRedirect}
                      className="flex-1"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Falar pelo WhatsApp
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;