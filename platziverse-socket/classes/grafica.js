
 class GraficaData {

     meses = ['enero', 'febrero', 'marzo', 'abril' ];
     valores = [0, 0, 0, 0];

    constructor() { }

    getDataGrafica() {
        return [
            { data: this.valores , label: 'Ventas'}
        ];
    }

    incrementarValor( mes , valor  ) {

        mes = mes.toLowerCase().trim();

        for( let i in this.meses ) {

            if ( this.meses[i] === mes ) {
                this.valores[i] += valor;
            }

        }

        return this.getDataGrafica();

    }


}

module.exports = GraficaData ;
