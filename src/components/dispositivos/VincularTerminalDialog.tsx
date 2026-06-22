import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useData } from "@/store/data-store";
import { toast } from "sonner";

export function VincularTerminalDialog({ trigger }: { trigger: ReactNode }) {
  const { clientes, vincularDispositivo, criarCliente } = useData();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [clienteId, setClienteId] = useState<string>("");
  const [novoCliente, setNovoCliente] = useState("");
  const [codigo, setCodigo] = useState("");
  const [saving, setSaving] = useState(false);

  const isNovo = clienteId === "__novo__";

  const reset = () => {
    setNome("");
    setClienteId("");
    setNovoCliente("");
    setCodigo("");
    setSaving(false);
  };

  const handleSubmit = async () => {
    if (!nome.trim()) return toast.error("Informe o nome do ponto de tela");
    if (!clienteId) return toast.error("Selecione um cliente");
    if (isNovo && !novoCliente.trim()) return toast.error("Informe o nome do novo cliente");
    if (codigo.length !== 6) return toast.error("Código de pareamento deve ter 6 dígitos");

    setSaving(true);
    try {
      let cid = clienteId;
      if (isNovo) {
        const c = await criarCliente({
          nome_estabelecimento: novoCliente.trim(),
          contato: "",
        });
        cid = c.id;
      }
      await vincularDispositivo({
        cliente_id: cid,
        nome_tela: nome.trim(),
        codigo_vinculo: codigo,
      });
      toast.success("Terminal vinculado com sucesso");
      reset();
      setOpen(false);
    } catch (e) {
      toast.error("Falha ao vincular terminal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Vincular novo terminal</DialogTitle>
          <DialogDescription>
            Use o código exibido pelo app na TV para parear o dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome do ponto de tela</Label>
            <Input
              id="nome"
              placeholder="Ex: Tela Principal — Recepção"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome_estabelecimento}
                  </SelectItem>
                ))}
                <SelectItem value="__novo__">+ Novo cliente…</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isNovo ? (
            <div className="space-y-1.5">
              <Label htmlFor="novo">Nome do novo estabelecimento</Label>
              <Input
                id="novo"
                placeholder="Ex: Padaria Central"
                value={novoCliente}
                onChange={(e) => setNovoCliente(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label>Código de pareamento</Label>
            <InputOTP maxLength={6} value={codigo} onChange={setCodigo}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Gerado pelo aplicativo player rodando na TV.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Vinculando…" : "Vincular terminal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}