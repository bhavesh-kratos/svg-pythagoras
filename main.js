console.log('heree')
window.onload = function () {
    document.getElementById("text").addEventListener("click", generateSquare);

    let squareSVG = document.getElementById("squareSVG");
    let svgDoc = squareSVG.contentDocument;
    let timeOut;

    function createSquare() {
        let points = ['P1', 'P2', 'P3', 'P4'];
        var polygonPoints = "";

        for (let point of points) {
            let pointElement = svgDoc.getElementById(point);
            let pointMatrix = pointElement.transform.baseVal.length === 0 ? { e: 0, f: 0 } : pointElement.transform.baseVal.getItem(0).matrix;
            polygonPoints += `${pointElement.cx.baseVal.value + pointMatrix.e},${pointElement.cy.baseVal.value + pointMatrix.f} `;
        }

        // create and append polygon
        const squareClone = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');

        // calculate the angle to align the square
        let point1Delta = svgDoc.getElementById('P1').transform.baseVal.length === 0 ? 0 : svgDoc.getElementById('P1').transform.baseVal.getItem(0).matrix.e;
        const rotateAngle = Math.atan(Math.abs(point1Delta + 60) / Math.abs(point1Delta - 240))

        squareClone.setAttribute('points', polygonPoints);
        squareClone.setAttribute('id', 'square-clone');
        squareClone.setAttribute('fill', 'dodgerblue');
        squareClone.animate([
            // keyframes
            { transform: 'translate(0px, 0px) rotate(0deg)' },
            { transform: `translate(350px) rotate(${rotateAngle}rad)` }
        ], {
                duration: 800,
                iterations: 1,
                fill: 'forwards'
            });

        svgDoc.getElementById('square').append(squareClone)
    }

    function generateSquare() {
        if (!svgDoc.getElementById('square-clone')) {
            createSquare();
            timeOut = setTimeout(function () {
                let elem = svgDoc.getElementById('square-clone');
                return elem.parentNode.removeChild(elem);
            }, 6000)
        }
        // else {
        //     clearTimeout(timeOut);
        //     let elem = svgDoc.getElementById('square-clone');
        //     elem.parentNode.removeChild(elem);
        //     createSquare();
        // }
    }
}