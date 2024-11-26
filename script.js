function base64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function (c) {
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
    const contact = {
        fullName: "",
        nickname: "",
        organization: "",
        title: "",
        workEmail: "",
        homeEmail: "",
        cellPhone: "",
        workPhone: "",
        workAddress: "",
        birthday: "",
        workWebsite: "",
        personalWebsite: "",
        socialProfiles: []
    };

    vCardLines.forEach(line => {
        if (line.startsWith('FN:')) {
            contact.fullName = line.substring(3);
        } else if (line.startsWith('NICKNAME:')) {
            contact.nickname = line.substring(9);
        } else if (line.startsWith('ORG:')) {
            contact.organization = line.substring(4);
        } else if (line.startsWith('TITLE:')) {
            contact.title = line.substring(6);
        } else if (line.startsWith('EMAIL;TYPE=WORK:')) {
            contact.workEmail = line.substring(16);
        } else if (line.startsWith('EMAIL;TYPE=HOME:')) {
            contact.homeEmail = line.substring(16);
        } else if (line.startsWith('TEL;TYPE=CELL:')) {
            contact.cellPhone = line.substring(14);
        } else if (line.startsWith('TEL;TYPE=WORK:')) {
            contact.workPhone = line.substring(14);
        } else if (line.startsWith('ADR;TYPE=WORK:')) {
            const addressParts = line.substring(14).split(';');
            contact.workAddress = addressParts.filter(Boolean).join(', ');
        } else if (line.startsWith('BDAY:')) {
            const bday = line.substring(5);
            contact.birthday = `${bday.slice(0, 4)}-${bday.slice(4, 6)}-${bday.slice(6, 8)}`;
        } else if (line.startsWith('URL;TYPE=WORK:')) {
            contact.workWebsite = line.substring(14);
        } else if (line.startsWith('URL;TYPE=PERSONAL:')) {
            contact.personalWebsite = line.substring(18);
        } else if (line.startsWith('X-SOCIALPROFILE;')) {
            contact.socialProfiles.push(line.substring(line.indexOf(':') + 1));
        }
    });

    return contact;
}

function displayVCard(contact) {
    const contactContainer = document.getElementById('contact-info');
    contactContainer.innerHTML = `
        <p><strong>Full Name:</strong> ${contact.fullName}</p>
        <p><strong>Nickname:</strong> ${contact.nickname}</p>
        <p><strong>Organization:</strong> ${contact.organization}</p>
        <p><strong>Title:</strong> ${contact.title}</p>
        <p><strong>Work Email:</strong> ${contact.workEmail}</p>
        <p><strong>Home Email:</strong> ${contact.homeEmail}</p>
        <p><strong>Cell Phone:</strong> ${contact.cellPhone}</p>
        <p><strong>Work Phone:</strong> ${contact.workPhone}</p>
        <p><strong>Work Address:</strong> ${contact.workAddress}</p>
        <p><strong>Birthday:</strong> ${contact.birthday}</p>
        <p><strong>Work Website:</strong> <a href="${contact.workWebsite}" target="_blank">${contact.workWebsite}</a></p>
        <p><strong>Personal Website:</strong> <a href="${contact.personalWebsite}" target="_blank">${contact.personalWebsite}</a></p>
        <p><strong>Social Profiles:</strong> ${contact.socialProfiles.map(profile => `<a href="${profile}" target="_blank">${profile}</a>`).join(', ')}</p>
    `;
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
            const inputVCard = vcardInput.value.trim();
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('vcard', inputVCard);
            const newUrl = `${window.location.pathname}?${newParams.toString()}`;

            // Redirect to the new URL with the vCard parameter
            window.location.href = newUrl;
        });
    }
}

window.onload = handleVCard;