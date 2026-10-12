import RectCanvas from "./RectCanvas";
import rectangles from "../data/rectangles.json";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Graph</h1>
        <RectCanvas rectangles={rectangles} />
      </main>
    </div>
  );
}
