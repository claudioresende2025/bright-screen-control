import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/store/data-store";
import type { Cliente } from "@/types/database";
import { toast } from "sonner";

export function ClienteFormDialog({
  trigger,
  cliente,
}: {
  trigger: ReactNode;
  cliente?: Cliente;
}) {
  const { criarCliente, atualizarCliente } = useData();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(cliente?.nome_estabelecimento ?? "");
  const [contato, setContato] = useState(cliente?.contato ?? "");

  const handle = async () => {
    if (!nome.trim()) return toast.error("Informe o nome do estabelecimento");
    if (cliente) {
      await atualizarCliente(cliente.id, {
        nome_estabelecimento: nome.trim(),
        contato: contato.trim(),
      });
      toast.success("Cliente atualizado");
    } else {
      await criarCliente({ nome_estabelecimento: nome.trim(), contato: contato.trim() });
      toast.success("Cliente cadastrado");
      setNome("");
      setContato("");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cli-nome">Estabelecimento</Label>
            <Input
              id="cli-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Padaria Central"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cli-contato">Contato</Label>
            <Input
              id="cli-contato"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              placeholder="email@exemplo.com ou telefone"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handle}>{cliente ? "Salvar" : "Cadastrar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}