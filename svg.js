// todo: add constraint params
function makeDraggable(evt) {
    let points = ['P1', 'P2', 'P3', 'P4'];
    let lines = ['L1', 'L2', 'L3', 'L4'];
    let svg = evt.target;    
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);
    svg.addEventListener('touchstart', startDrag);
    svg.addEventListener('touchmove', drag);
    svg.addEventListener('touchend', endDrag);
    svg.addEventListener('touchleave', endDrag);
    svg.addEventListener('touchcancel', endDrag);

    let selectedPointElement, offset, transform, cx, cy,
        minX, maxX, minY, maxY, ID, highlighter1, highlighter2;


    function getMousePosition(evt) {
        let CTM = svg.getScreenCTM();
        if (evt.touches) { evt = evt.touches[0]; }
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    function setLineCoordinates(lineElement, { x1, y1, x2, y2 }) {
        lineElement.setAttribute('x1', x1)
        lineElement.setAttribute('y1', y1)
        lineElement.setAttribute('x2', x2)
        lineElement.setAttribute('y2', y2)

    }

    function setHiglighterCoordinates() {
        if (ID === 'P1' || ID === 'P3') {
            setLineCoordinates(highlighter1, {
                x1: cx <= 60 ? 0 : 300,
                y1: cy,
                x2: cx + transform.matrix.e,
                y2: cy
            })
            setLineCoordinates(highlighter2, {
                x1: cx <= 60 ? 300 : 0,
                y1: cy,
                x2: cx + transform.matrix.e,
                y2: cy
            })
        }
        else {
            setLineCoordinates(highlighter1, {
                x1: cx,
                y1: cy <= 60 ? 0 : 300,
                x2: cx,
                y2: cy + transform.matrix.f
            })
            setLineCoordinates(highlighter2, {
                x1: cx,
                y1: cx <= 60 ? 300 : 0,
                x2: cx,
                y2: cy + transform.matrix.f
            })
        }
    }

    function appendHighlighters() {
        // initialize higlighters
        highlighter1 = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        highlighter2 = document.createElementNS("http://www.w3.org/2000/svg", 'line');

        highlighter1.setAttribute('stroke', 'green');
        highlighter1.setAttribute('id', 'Highlighter1');
        highlighter1.setAttribute('stroke-width', 4);
        highlighter1.setAttribute('stroke-linecap', 'round');

        highlighter2.setAttribute('stroke', 'dodgerblue');
        highlighter2.setAttribute('id', 'Highlighter2');
        highlighter2.setAttribute('stroke-width', 4);
        highlighter2.setAttribute('stroke-linecap', 'round');

        setHiglighterCoordinates();

        // append higlighter
        selectedPointElement.parentNode.insertBefore(highlighter1, selectedPointElement);
        selectedPointElement.parentNode.insertBefore(highlighter2, selectedPointElement)        
    }


    function removeHighlighters() {
        highlighter1.parentNode.removeChild(highlighter1);
        highlighter2.parentNode.removeChild(highlighter2);
        highlighter1 = false;
        highlighter2 = false;
    }

    function moveLines() {
        for (let line of lines) {
            let lineElement = document.getElementById(line)
            let lineNumber = Number(line[1]); //cx.baseVal.value
            let point1Element = document.getElementById(`P${lineNumber}`)
            let point2Element = document.getElementById(`P${lineNumber === 4 ? 1 : lineNumber + 1}`)

            let point1Matrix = point1Element.transform.baseVal.getItem(0).matrix;
            let point2Matrix = point2Element.transform.baseVal.getItem(0).matrix;

            setLineCoordinates(lineElement, {
                x1: point1Element.cx.baseVal.value + point1Matrix.e,
                y1: point1Element.cy.baseVal.value + point1Matrix.f,
                x2: point2Element.cx.baseVal.value + point2Matrix.e,
                y2: point2Element.cy.baseVal.value + point2Matrix.f
            })
            // lineElement.setAttribute('x1', point1Element.cx.baseVal.value + point1Matrix.e)
            // lineElement.setAttribute('y1', point1Element.cy.baseVal.value + point1Matrix.f)
            // lineElement.setAttribute('x2', point2Element.cx.baseVal.value + point2Matrix.e)
            // lineElement.setAttribute('y2', point2Element.cy.baseVal.value + point2Matrix.f)

        }
    }

    function moveOtherPointers(delta) {

        for (let point of points) {
            if (point !== ID) {
                let pointElement = document.getElementById(point);
                let shiftDelta = ID[1] === "3" || ID[1] === "4" ? -delta : delta;

                if (point === 'P1') {
                    pointElement.setAttribute('transform', `translate(${shiftDelta},${0})`);
                }
                else if (point === 'P2') {
                    pointElement.setAttribute('transform', `translate(${0},${shiftDelta})`);
                }
                else if (point === 'P3') {
                    pointElement.setAttribute('transform', `translate(${-shiftDelta},${0})`);
                }
                else {
                    pointElement.setAttribute('transform', `translate(${0},${-shiftDelta})`);
                }
            }
        }
        moveLines()
    }

    function startDrag(evt) {
        if (evt.target.classList.contains('draggable')) {
            selectedPointElement = evt.target;
            offset = getMousePosition(evt);

            let transforms = selectedPointElement.transform.baseVal;

            if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                // Create an transform that translates by (0, 0)
                let translate = svg.createSVGTransform();
                translate.setTranslate(0, 0);
                selectedPointElement.transform.baseVal.insertItemBefore(translate, 0);
            }

            // Get initial translation
            transform = transforms.getItem(0);
            offset.x -= transform.matrix.e;
            offset.y -= transform.matrix.f;

            ID = selectedPointElement.id;
            cx = selectedPointElement.cx.baseVal.value;
            cy = selectedPointElement.cy.baseVal.value;

            if (ID === 'P1' || ID === 'P3') {
                minX = -cx
                maxX = 300 - cx
                minY = 0
                maxY = 0
            }

            // for (ID === 'P4' || ID === 'P2')
            else {
                minX = 0
                maxX = 0
                minY = -cy
                maxY = 300 - cy
            }            
            appendHighlighters()
        }
    }

    function drag(evt) {
        if (selectedPointElement) {
            evt.preventDefault();

            let coord = getMousePosition(evt);
            let dx = coord.x - offset.x;
            let dy = coord.y - offset.y;
            let delta

            if (dx < minX) { dx = minX; }
            else if (dx > maxX) { dx = maxX; }
            if (dy < minY) { dy = minY; }
            else if (dy > maxY) { dy = maxY; }
            delta = dx || dy;            
            selectedPointElement.setAttribute('opacity', 1)
            // move other points, lines, highlight
            setHiglighterCoordinates();
            moveOtherPointers(delta)
            transform.setTranslate(dx, dy);
        }
    }

    function endDrag(evt) {
        if (highlighter1 || highlighter2)
            removeHighlighters();
        selectedPointElement = false;
    }
}