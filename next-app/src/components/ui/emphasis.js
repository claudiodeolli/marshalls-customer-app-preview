// Os textos que vêm dos documentos do cliente trazem trechos em negrito, e
// ele pede explicitamente para preservá-los ("mantem os negritos ali do
// texto", issue #5; "e com os negritos", issue #9). Guardar a ênfase junto
// da frase, entre **, mantém copy e destaque no mesmo lugar — em vez de
// espalhar <strong> pelo JSX e ter que recortar a frase para editá-la.

/** Renderiza os trechos entre ** em negrito, preservando o resto do texto. */
export function withEmphasis(text) {
  return text.split('**').map((part, index) => (
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
  ));
}
