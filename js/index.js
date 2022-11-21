/* 
*/

const processa = (elem) => {
    const fr = new FileReader()
    fr.readAsText(elem.files[0])
    fr.onload = () => codifica(fr.result)
}

const codifica = (arquivo) => {

    let resultado = ''

    const separaVirgula = (str) => str.split(',')

    const geraResistro = (lista) => {
        const listaInfo = separaVirgula(lista)
        return { ano_periodo: listaInfo[0], codigoDisciplina: listaInfo[1], CH: parseInt(listaInfo[2]), Freq: parseFloat(listaInfo[3]), Nota: parseFloat(listaInfo[4]) }
    }

    const geraListaResistro = (file, lista = [], count = 0) => {
        const newFile = file.split('\n')
        if (count == newFile.length) return lista
        const newElement = geraResistro(newFile[count])
        lista.push(newElement)
        return geraListaResistro(file, lista, ++count)
    }

    //Criou a lista de objetos materias
    const materias = geraListaResistro(arquivo)

    const separaPeriodos = () => materias.map(materias => materias.ano_periodo)
    const separaCH = () => materias.map(materias => materias.CH)
    const separaNotas = () => materias.map(materias => materias.Nota)

    //Tempo de curso (em períodos)

    const tiraRepetido = (lista) => lista.filter((periodo, posPeriodo) => lista.indexOf(periodo) == posPeriodo)

    const tempo = (materias) => {
        const periodos = tiraRepetido(separaPeriodos(materias)).length
        return `TEMPO DE CURSO (EM PERÍODOS): ${periodos}.`
    }

    //Imprimi tempo de curso
    const tempoPeriodos = tempo(materias)

    //Média geral ponderada pela CH

    const somaMultiplica = (CH, Nota, contador = 0) => {
        if (contador == CH.length) return 0
        else return (CH[contador] / 15) * Nota[contador] + somaMultiplica(CH, Nota, ++contador)
    }

    const somaPesos = (CH, contador = 0) => {
        if (contador == CH.length) return 0
        else return (CH[contador] / 15) + somaPesos(CH, ++contador)
    }

    const mediaPonderada = () => {
        return (somaMultiplica(separaCH(), separaNotas()) / somaPesos(separaCH())).toFixed(2)
    }

    const mediaPonderadaStr = `MÉDIA GERAL PONDERADA: ${mediaPonderada()}.`

    //Desvio padrão da média geral

    const desvioPadrao = () => {
        const soma = materias.reduce((resultado, materias) => resultado + (materias.Nota - mediaPonderada()) ** 2, 0)
        return (Math.sqrt(soma / (materias.length))).toFixed(2)
    }

    const desvioPadraoStr = `DESVIO PADRÃO DA MÉDIA GERAL: ${desvioPadrao()}.`

    //Lista de disciplinas com aprovação,

    const aprovado = materias.filter(materias => materias.Nota >= 5 && materias.Freq >= 75)

    const aprovadoLista = (count = 0) => {
        if (count == aprovado.length) return ''
        else if (count == aprovado.length - 1) return `${aprovado[count].codigoDisciplina}.`
        else return `${aprovado[count].codigoDisciplina}, ` + aprovadoLista(++count)
    }

    const aprovadoStr = `APROVADO: ` + aprovadoLista()

    const reprovadoFalta = materias.filter(materias => materias.Nota >= 5 && materias.Freq < 75)
    const reprovadoMedia = materias.filter(materias => materias.Nota < 5 && materias.Freq >= 75)
    const reprovadoMediaEFalta = materias.filter(materias => materias.Nota < 5 && materias.Freq < 75)
    
    const repMedia = (count = 0) => {
        if (count == reprovadoMedia.length) return ''
        else if (count == reprovadoMedia.length-1) return `${reprovadoMedia[count].codigoDisciplina}.`
        else return `${reprovadoMedia[count].codigoDisciplina}, ` + repMedia(++count)
    }
    
    const repFalta = (count = 0) => {
        if (count == reprovadoFalta.length) return ''
        else if (count == reprovadoFalta.length-1) return `${reprovadoFalta[count].codigoDisciplina}.`
        else return `${reprovadoFalta[count].codigoDisciplina}, ` + repFalta(++count)
    }
    
    const repMediaEFalta = (count = 0) => {
        if (count == reprovadoMediaEFalta.length) return ''
        else if (count == reprovadoMediaEFalta.length-1) return `${reprovadoMediaEFalta[count].codigoDisciplina}.`
        else return `${reprovadoMediaEFalta[count].codigoDisciplina}, ` + repMediaEFalta(++count)
    }
    
    const strRepMedia = 'REPROVADO POR MÉDIA: ' + repMedia()
    const strRepFalta = 'REPROVADO POR FALTA: ' + repFalta()
    const strRepMediaEFalta = 'REPROVADO POR MÉDIA E FALTA: ' + repMediaEFalta()

    //Carga horária total cursada,

    const chTotal = aprovado.reduce((resultado, materia) => {
        return (resultado + materia.CH)
    }, 0)

    const strCHTotal = `CARGA HORÁRIA TOTAL CURSADA: ${chTotal}.`

    //Média geral ponderada das disciplinas de cada departamento diferente (para isso, você tem que
    //tratar a string do código da disciplina)

    const separaDepartamento = (str) => str.slice(0, -4)
    const listaDepartamentos = () => materias.map(materia => separaDepartamento(materia.codigoDisciplina))
    const filtraDep = (departamento) => materias.filter(materia => separaDepartamento(materia.codigoDisciplina) == departamento)
    const separaCHDepartamento = (departamento) => filtraDep(departamento).map(materia => materia.CH)

    const somaNotasDepartamento = (departamento) => filtraDep(departamento).reduce((resultado, materia) => {
        return resultado + (materia.Nota * (materia.CH/15));
    }, 0);
    
    const mediaDepartamento = (departamento) => (somaNotasDepartamento(departamento)/somaPesos(separaCHDepartamento(departamento))).toFixed(2)

    const listaMediasDep = (contador = 0) => {
        if (contador == tiraRepetido(listaDepartamentos()).length - 1) return `MÉDIA DO DEPARTAMENTO ${tiraRepetido(listaDepartamentos())[contador]}: ${mediaDepartamento(tiraRepetido(listaDepartamentos())[contador])}.`
        else return `MÉDIA DO DEPARTAMENTO ${tiraRepetido(listaDepartamentos())[contador]}: ${mediaDepartamento(tiraRepetido(listaDepartamentos())[contador])}.<br>` + listaMediasDep(++contador)
    }

    resultado += (
        `<h3>${tempoPeriodos}</h3>` +
        `<h3>${mediaPonderadaStr}</h3>` +
        `<h3>${desvioPadraoStr}</h3>` +
        `<h3>${aprovadoStr}</h3>` +
        `<h3>${strRepMedia}</h3>` +
        `<h3>${strRepFalta}</h3>` +
        `<h3>${strRepMediaEFalta}</h3>` +
        `<h3>${strCHTotal}</h3>` +
        `<h3>${listaMediasDep()}</h3>`

    )
    
    document.getElementById('output').innerHTML = resultado

}