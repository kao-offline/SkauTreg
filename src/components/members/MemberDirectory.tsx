import { Button } from "../ui/Button";
import { EmptyStateCard } from "../ui/Card";
import styles from "./MemberDirectory.module.css";

type MemberSummary = { _id: string; name: string; nickname?: string; birthDate?: string; guardianName?: string; parentName?: string };

export default function MemberDirectory<T extends MemberSummary>({ members, onSelect }: { members: T[] | undefined; onSelect: (member: T) => void }) {
  if (!members) return <p role="status">Načítám seznam členů…</p>;
  if (!members.length) return <EmptyStateCard title="Žádní členové" description="Zkuste změnit hledání nebo přidat nového člena." />;
  return (
    <>
      <div className={styles.desktop}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Členové oddílu</caption>
          <thead><tr>{["Jméno", "Přezdívka", "Datum narození", "Zástupce", "Akce"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{members.map(member => <tr key={member._id}>
            <th scope="row">{member.name}</th><td>{member.nickname || "—"}</td><td>{member.birthDate || "—"}</td><td>{member.guardianName || member.parentName || "—"}</td>
            <td><Button variant="secondary" onClick={() => onSelect(member)} aria-label={`Zobrazit člena ${member.name}`}>Zobrazit</Button></td>
          </tr>)}</tbody>
        </table>
      </div>
      <ul className={styles.mobile} aria-label="Členové oddílu">
        {members.map(member => <li key={member._id}>
          <div className={styles.identity}><strong>{member.name}</strong>{member.nickname && <span>{member.nickname}</span>}</div>
          <dl><div><dt>Datum narození</dt><dd>{member.birthDate || "—"}</dd></div><div><dt>Zástupce</dt><dd>{member.guardianName || member.parentName || "—"}</dd></div></dl>
          <Button variant="secondary" onClick={() => onSelect(member)} aria-label={`Zobrazit člena ${member.name}`}>Zobrazit člena</Button>
        </li>)}
      </ul>
    </>
  );
}
