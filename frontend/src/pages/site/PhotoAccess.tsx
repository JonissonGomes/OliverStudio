import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, ExternalLink, Camera } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

const PhotoAccess = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const [result, setResult] = useState<{
    type: "success" | "error" | null;
    message: string;
    driveLink?: string;
  }>({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);

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
           formData.email.includes("@");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setResult({
        type: "error",
        message: "Por favor, preencha todos os campos corretamente.",
      });
      return;
    }

    setIsLoading(true);
    setResult({ type: null, message: "" });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Get events from localStorage (this would be from CRM in real implementation)
      const events = JSON.parse(localStorage.getItem("oliver-events") || "[]");
      
      // Search for matching client data
      const matchingEvent = events.find((event: any) => 
        event.clienteNome?.toLowerCase().includes(formData.nome.toLowerCase()) &&
        event.clienteEmail?.toLowerCase() === formData.email.toLowerCase() &&
        event.clienteTelefone?.includes(formData.telefone.replace(/\D/g, ""))
      );

      if (matchingEvent && matchingEvent.driveLink) {
        setResult({
          type: "success",
          message: "Dados validados com sucesso! Acesse suas fotos através do link abaixo:",
          driveLink: matchingEvent.driveLink,
        });
      } else {
        setResult({
          type: "error",
          message: "Dados não encontrados em nosso sistema. Verifique as informações ou entre em contato conosco.",
        });
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "Erro interno. Tente novamente em alguns minutos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nome: "", email: "", telefone: "" });
    setResult({ type: null, message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="bg-gradient-hero rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-medium">
            <Camera className="h-10 w-10 text-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Acesse Suas Fotos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Para acessar as fotos do seu evento, preencha os dados abaixo. 
            Eles devem corresponder exatamente às informações fornecidas durante a contratação.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Validação de Dados</CardTitle>
              <CardDescription>
                Insira suas informações para verificar o acesso às fotos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.type === null && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="elegant" 
                    className="w-full"
                    disabled={!isFormValid() || isLoading}
                  >
                    {isLoading ? "Verificando..." : "Verificar Acesso"}
                  </Button>
                </form>
              )}

              {result.type === "success" && (
                <div className="space-y-4">
                  <Alert className="border-success/20 bg-success/5">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      {result.message}
                    </AlertDescription>
                  </Alert>
                  
                  {result.driveLink && (
                    <div className="space-y-3">
                      <Button asChild variant="hero" className="w-full">
                        <a 
                          href={result.driveLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir Galeria de Fotos
                        </a>
                      </Button>
                      
                      <div className="text-center">
                        <Button variant="ghost" onClick={resetForm}>
                          Fazer Nova Consulta
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.type === "error" && (
                <div className="space-y-4">
                  <Alert className="border-destructive/20 bg-destructive/5">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      {result.message}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Button variant="outline" onClick={resetForm} className="w-full">
                      Tentar Novamente
                    </Button>
                    
                    <p className="text-sm text-muted-foreground text-center">
                      Ainda com problemas?{" "}
                      <a 
                        href="/contato" 
                        className="text-foreground hover:underline"
                      >
                        Entre em contato
                      </a>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Dicas Importantes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use exatamente o mesmo nome fornecido na contratação</li>
                  <li>• Verifique se o e-mail está correto</li>
                  <li>• O telefone deve incluir DDD</li>
                  <li>• As fotos ficam disponíveis por 30 dias</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PhotoAccess;