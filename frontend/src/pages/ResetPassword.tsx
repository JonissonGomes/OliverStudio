import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
					<CardDescription>Entre em contato com o administrador para redefinição de senha.</CardDescription>
          </CardHeader>
          <CardContent>
					<p className="text-sm text-muted-foreground">
						Funcionalidade de reset automático não está habilitada neste ambiente.
					</p>
          </CardContent>
        </Card>
    </div>
  );
};

export default ResetPassword;
