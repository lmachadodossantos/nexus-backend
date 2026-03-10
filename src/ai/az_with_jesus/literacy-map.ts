export const CHRISTIAN_LETTERS: Record<string, {
    reference: string;
    supportWords: string[];
}> = {
    A: { reference: "Amor", supportWords: ["Arca", "Amém"] },
    B: { reference: "Bíblia", supportWords: ["Bondade", "Bem"] },
    C: { reference: "Cristo", supportWords: ["Cruz", "Céu"] },
    D: { reference: "Davi", supportWords: ["Deus", "Dom"] },
    E: { reference: "Ester", supportWords: ["Esperança", "Escutar"] },
    F: { reference: "Fé", supportWords: ["Força", "Filho"] },
    G: { reference: "Graça", supportWords: ["Golias", "Glória"] },
    H: { reference: "Hosana", supportWords: ["Humildade", "Herói"] },
    I: { reference: "Igreja", supportWords: ["Irmão", "Isaías"] },
    J: { reference: "Jesus", supportWords: ["José", "Jerusalém"] },
    K: { reference: "Kairós", supportWords: ["Koinonia"] },
    L: { reference: "Louvor", supportWords: ["Luz", "Livro"] },
    M: { reference: "Moisés", supportWords: ["Maria", "Milagre"] },
    N: { reference: "Noé", supportWords: ["Navio", "Ninho"] },
    O: { reference: "Oração", supportWords: ["Olhar", "Obedecer"] },
    P: { reference: "Pedro", supportWords: ["Paz", "Palavra"] },
    Q: { reference: "Querer o bem", supportWords: ["Quietinho", "Querer"] },
    R: { reference: "Rute", supportWords: ["Rei", "Rocha"] },
    S: { reference: "Samuel", supportWords: ["Salmo", "Semente"] },
    T: { reference: "Templo", supportWords: ["Terra", "Tesouro"] },
    U: { reference: "União", supportWords: ["Unção", "Um"] },
    V: { reference: "Vida", supportWords: ["Verdade", "Vitória"] },
    W: { reference: "Wesley", supportWords: ["Worship"] },
    X: { reference: "Xodó de Deus", supportWords: ["Xilofone"] },
    Y: { reference: "Yeshua", supportWords: ["Yahweh"] },
    Z: { reference: "Zaqueu", supportWords: ["Zelo", "Zion"] }
};

export function getLetterConfig(letter: string) {
    const normalized = (letter || "A").trim().toUpperCase().slice(0, 1);
    return {
        letter: normalized,
        ...(CHRISTIAN_LETTERS[normalized] || CHRISTIAN_LETTERS.A)
    };
}