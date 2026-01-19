logseq.ready(() => {
  logseq.Editor.registerSlashCommand("Mark QA + Importance + SRS", async () => {
    const block = await logseq.Editor.getCurrentBlock();
    if (!block) return;

    const content = block.content;

    // 1. 「！」の連続をすべて検出（行頭でなくてもOK）
    const bangs = [...content.matchAll(/！+/g)];
    if (bangs.length === 0) return;

    // 最長の連続数を取得
    const maxBang = Math.max(...bangs.map(m => m[0].length));

    // 2. 重要度判定 → タグ
    let levelTag = "";
    if (maxBang === 3) levelTag = "[[#C]]";      // C
    else if (maxBang === 4) levelTag = "[[#B]]"; // B
    else if (maxBang >= 5) levelTag = "[[#A]]";  // A
    else return; // 1〜2個は対象外

    // 3. 問題・答え判定
    let qaTag = "";
    if (content.includes("？？？")) {
      qaTag = "[[Q]]";
    } else if (content.match(/！！！+/)) {
      qaTag = "[[A]]";
    }

    // 4. SRS（Easy / Good / Hard）ポップアップ
    const choice = await logseq.UI.showMsg(
      "難易度を選んでください：Easy / Good / Hard",
      "warning",
      {
        buttons: [
          { title: "Easy" },
          { title: "Good" },
          { title: "Hard" }
        ]
      }
    );

    let srsTag = "";
    if (choice === "Easy") srsTag = "[[EASY]]";
    if (choice === "Good") srsTag = "[[GOOD]]";
    if (choice === "Hard") srsTag = "[[HARD]]";

    // 5. タグ付与
    let updated = content;

    if (!updated.includes("#card")) updated += " #card";
    if (!updated.includes(levelTag)) updated += " " + levelTag;
    if (qaTag && !updated.includes(qaTag)) updated += " " + qaTag;
    if (srsTag && !updated.includes(srsTag)) updated += " " + srsTag;

    await logseq.Editor.updateBlock(block.uuid, updated);
  });
});
