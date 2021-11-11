$(document).ready((d) => {

    $('#copyright').click(() => $('#modal').modal());

    const delay = () => {
        return new Promise((resolve, reject) => setTimeout(resolve, 250));
    }

    let ho;

    const ajustar = async() => {
        await delay();
        let cont = document.getElementById('cont');
        let pie = document.getElementById('pie');
        let elements = document.getElementById('elements');
        let total = pie.getBoundingClientRect().y + pie.getBoundingClientRect().height;
        let height = window.innerHeight;
        let aumento = height - total;
        let aux = cont.getBoundingClientRect().height + aumento;
        if (!ho) {
            ho = window.innerHeight;
        }
        cont.setAttribute("style", "height:" + aux + "px;");
        if (aux > 500) {
            let posY = aux / 2 - elements.getBoundingClientRect().height / 2;
            if (posY > 0) {
                elements.setAttribute("style", "margin-top:" + (posY) + "px!important;");
            }
        }
    };

    window.addEventListener("resize", () => ajustar());

    ajustar();

});