import { Button } from "@/components/ui/button";

interface RowActionsProps {
  onEdit?: (() => void) | undefined;
  onDelete: () => void;
  editLabel?: string | undefined;
  deleteLabel?: string | undefined;
  itemLabel: string;
}

/** Ações de linha em texto: mais legíveis que ícones ambíguos. */
export function RowActions({
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Excluir",
  itemLabel,
}: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-[13px]"
          onClick={onEdit}
          aria-label={`${editLabel} ${itemLabel}`}
        >
          {editLabel}
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-[13px] text-muted-foreground hover:text-destructive"
        onClick={onDelete}
        aria-label={`${deleteLabel} ${itemLabel}`}
      >
        {deleteLabel}
      </Button>
    </div>
  );
}
