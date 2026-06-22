import { createFileRoute } from "@tanstack/react-router";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { ClienteFormDialog } from "@/components/clientes/ClienteFormDialog";
import { useData } from "@/store/data-store";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — SignageHub" },
      { name: "description", content: "Cadastro de estabelecimentos parceiros." },
      { property: "og:title", content: "Clientes — SignageHub" },
      { property: "og:description", content: "Gerencie os clientes que recebem mídia indoor." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const { clientes, dispositivos, removerCliente } = useData();

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} estabelecimentos cadastrados`}
        action={
          <ClienteFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-1.5" /> Novo Cliente
              </Button>
            }
          />
        }
      />

      {clientes.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum cliente cadastrado"
          description="Cadastre o primeiro estabelecimento parceiro para vincular TVs."
          action={
            <ClienteFormDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-1.5" /> Cadastrar
                </Button>
              }
            />
          }
        />
      ) : (
        <Card className="bg-card/70 border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Estabelecimento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-center">TVs</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((c) => {
                const tvs = dispositivos.filter((d) => d.cliente_id === c.id).length;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome_estabelecimento}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.contato || "—"}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{tvs}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ClienteFormDialog
                          cliente={c}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (
                              !confirm(
                                `Remover "${c.nome_estabelecimento}"? As TVs vinculadas também serão removidas.`,
                              )
                            )
                              return;
                            await removerCliente(c.id);
                            toast.success("Cliente removido");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}