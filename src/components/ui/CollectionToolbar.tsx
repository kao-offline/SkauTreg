import type { ReactNode } from "react";
import { Field, FieldLabel, SelectInput, TextInput } from "./Form";
import styles from "./CollectionToolbar.module.css";

export function CollectionToolbar({ troops, troopId, onTroopChange, search, onSearchChange, searchLabel, children, filters }: {
  troops: Array<{ _id: string; name: string }>;
  troopId: string | null;
  onTroopChange: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  children: ReactNode;
  filters?: ReactNode;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Field>
          <FieldLabel>Oddíl</FieldLabel>
          <SelectInput value={troopId || ""} onChange={event => onTroopChange(event.target.value)} disabled={!troops.length}>
            {!troops.length && <option value="">Žádný oddíl</option>}
            {troops.map(troop => <option key={troop._id} value={troop._id}>{troop.name}</option>)}
          </SelectInput>
        </Field>
        <Field className={styles.search}>
          <FieldLabel>{searchLabel}</FieldLabel>
          <TextInput type="search" value={search} onChange={event => onSearchChange(event.target.value)} placeholder={searchLabel} />
        </Field>
        <div className={styles.actions}>{children}</div>
      </div>
      {filters && <div className={styles.filters} role="group" aria-label="Zobrazení výprav">{filters}</div>}
    </div>
  );
}
