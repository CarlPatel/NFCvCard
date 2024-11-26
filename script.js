function base64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function base64ToBlob(base64, mime) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
}

function parseVCard(vCardData) {
    const vCardLines = vCardData.split('\n');
    let contact = {
        name: "N/A",
        email: "N/A",
        phone: "N/A",
        address: "N/A",
        organization: "N/A"
    };

    vCardLines.forEach(line => {
        if (line.startsWith('FN:')) {
            contact.name = line.substring(3);
        } else if (line.startsWith('EMAIL;')) {
            contact.email = line.substring(6);
        } else if (line.startsWith('TEL:')) {
            contact.phone = line.substring(4);
        } else if (line.startsWith('ADR:')) {
            contact.address = line.substring(4).replace(/;/g, ', ');
        } else if (line.startsWith('ORG:')) {
            contact.organization = line.substring(4);
        }
    });

    return contact;
}

function displayVCard(contact) {
    document.getElementById('name').textContent = contact.name;
    document.getElementById('email').textContent = contact.email;
    document.getElementById('phone').textContent = contact.phone;
    document.getElementById('address').textContent = contact.address;
    document.getElementById('organization').textContent = contact.organization;
}

function downloadVCard(base64VCard) {
    const blob = base64ToBlob(base64VCard, 'text/vcard');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleVCard() {
    const params = new URLSearchParams(window.location.search);
    const base64VCard = params.get('vcard');
    
    if (base64VCard) {
        const decodedVCard = base64DecodeUnicode(base64VCard);
        console.log(decodedVCard);
        const contact = parseVCard(decodedVCard);
        console.log(contact);
        
        // Display the vCard info
        displayVCard(contact);

        // Trigger the download
        //downloadVCard(base64VCard);
    } else {
        // No vCard data found, create a textbox and button
        const container = document.getElementById('contact-info');
        container.innerHTML = `
            <label for="vcard-input">Enter vCard base64 data:</label>
            <input type="text" id="vcard-input" placeholder="Paste base64 vCard data here">
            <button id="submit-vcard">Submit</button>
        `;

        const submitButton = container.querySelector('#submit-vcard');
        const vcardInput = container.querySelector('#vcard-input');

        submitButton.addEventListener('click', () => {
            const inputVCard = vcardInput.value;
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('vcard', inputVCard);
            const newUrl = `${window.location.pathname}?${newParams.toString()}`;
            
            // Redirect to the new URL with the vCard parameter
            window.location.href = newUrl;
        });
    }
}

window.onload = handleVCard;