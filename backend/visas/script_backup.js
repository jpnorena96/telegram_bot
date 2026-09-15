
        // Llenar selects de dÃ­as para todas las fechas del formulario
        const selectsDias = ['dobDay', 'arrivalDay', 'specificArrivalDay', 'specificDepDay', 'prevUsVisitDay', 'prevVisaIssuedDay', 'fatherDobDay', 'motherDobDay', 'empStartDateDay', 'prevEmpFromDay', 'prevEmpToDay', 'prevEducFromDay', 'prevEducToDay', 'militaryFromDay', 'militaryToDay'];
        selectsDias.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            for (let i = 1; i <= 31; i++) {
                const d = i < 10 ? '0' + i : i;
                el.innerHTML += `<option value="${i}">${d}</option>`;
            }
        });

        // Valores por defecto para pruebas rÃ¡pidas
        document.getElementById('dobDay').value = '15';
        document.getElementById('arrivalDay').value = '15';
        document.getElementById('specificArrivalDay').value = '15';
        document.getElementById('specificDepDay').value = '30';

        // Checkbox "Does Not Apply / Do Not Know" (deshabilita el input asociado)
        function toggleInputByCheckbox(checkboxId, inputId) {
            const cb = document.getElementById(checkboxId);
            const input = document.getElementById(inputId);
            if (cb.checked) {
                input.value = "";
                input.disabled = true;
            }
            cb.addEventListener('change', function () {
                if (this.checked) {
                    input.value = "";
                    input.disabled = true;
                } else {
                    input.disabled = false;
                    input.focus();
                }
            });
        }

        toggleInputByCheckbox('nationalIdNA', 'nationalId');
        toggleInputByCheckbox('ssnNA', 'ssn');
        toggleInputByCheckbox('taxIdNA', 'taxId');
        toggleInputByCheckbox('prevUsDriverLicenseNA', 'prevUsDriverLicenseNum');
        toggleInputByCheckbox('prevVisaNumberNA', 'prevVisaNumber');

        document.getElementById('nativeName').addEventListener('change', function () {
            document.getElementById('nativeNameText').style.display = this.value === 'TEXT' ? 'block' : 'none';
        });

        // -----------------------------------------------------------------
        // SECCIÃ“N 3: LOGICAS CONDICIONALES
        // -----------------------------------------------------------------
        function actualizarPlanesViaje() {
            const val = document.getElementById('specificTravelPlans').value;
            const divNo = document.getElementById('divPlanesNo');
            const divYes = document.getElementById('divPlanesYes');
            if (val === 'Y') {
                divNo.style.display = 'none';
                divYes.style.display = 'block';
            } else {
                divNo.style.display = 'block';
                divYes.style.display = 'none';
            }
        }

        function actualizarQuienPaga() {
            const val = document.getElementById('whoIsPaying').value;
            const divOtra = document.getElementById('divPagaOtraPersona');
            const divEmp = document.getElementById('divPagaEmpresa');

            divOtra.style.display = 'none';
            divEmp.style.display = 'none';

            if (val === 'O') {
                divOtra.style.display = 'block';
            } else if (['P', 'U', 'C', 'H'].includes(val)) {
                divEmp.style.display = 'block';
            }
        }

        const visasMap = {
            "A": [{ val: "A1-AM", text: "AMBASSADOR OR PUBLIC MINISTER (A1)" }, { val: "A1-CH", text: "CHILD OF AN A1 (A1)" }, { val: "A1-DP", text: "CAREER DIPLOMAT/CONSULAR OFFICER (A1)" }, { val: "A1-SP", text: "SPOUSE OF AN A1 (A1)" }, { val: "A2-CH", text: "CHILD OF AN A2 (A2)" }, { val: "A2-EM", text: "FOREIGN OFFICIAL/EMPLOYEE (A2)" }, { val: "A2-SP", text: "SPOUSE OF AN A2 (A2)" }, { val: "A3-CH", text: "CHILD OF AN A3 (A3)" }, { val: "A3-EM", text: "PERSONAL EMP. OF AN A1 OR A2 (A3)" }, { val: "A3-SP", text: "SPOUSE OF AN A3 (A3)" }],
            "B": [{ val: "B1-B2", text: "BUSINESS OR TOURISM (TEMPORARY VISITOR) (B1/B2)" }, { val: "B1-CF", text: "BUSINESS/CONFERENCE (B1)" }, { val: "B2-TM", text: "TOURISM/MEDICAL TREATMENT (B2)" }, { val: "BC-C", text: "BORDER CROSSING CARD (MEXICO ONLY) (BCC)" }],
            "C": [{ val: "C1-D", text: "CREWMEMBER IN TRANSIT (C1/D)" }, { val: "C1-TR", text: "TRANSIT (C1)" }, { val: "C2-UN", text: "TRANSIT TO U.N. HEADQUARTERS (C2)" }, { val: "C3-CH", text: "CHILD OF A C3 (C3)" }, { val: "C3-EM", text: "PERSONAL EMP. OF A C3 (C3)" }, { val: "C3-FR", text: "FOREIGN OFFICIAL IN TRANSIT (C3)" }, { val: "C3-SP", text: "SPOUSE OF A C3 (C3)" }, { val: "C4-NO", text: "NONCITIZEN IN TRANSIT LIGHTERING OP. (C4)" }, { val: "C4-D3", text: "LIGHTERING CREWMEMBER IN TRANSIT (C4/D3)" }],
            "CNMI": [{ val: "CW1-CW1", text: "CNMI TEMPORARY WORKER (CW1)" }, { val: "CW2-CH", text: "CHILD OF CW1 (CW2)" }, { val: "CW2-SP", text: "SPOUSE OF CW1 (CW2)" }, { val: "E2C-E2C", text: "CNMI LONG TERM INVESTOR (E2C)" }],
            "D": [{ val: "D-D", text: "CREWMEMBER (D)" }, { val: "D3-LI", text: "LIGHTERING CREWMEMBER (D3)" }],
            "E": [{ val: "E1-CH", text: "CHILD OF AN E1 (E1)" }, { val: "E1-EX", text: "EXECUTIVE/MGR/ESSENTIAL EMP (E1)" }, { val: "E1-SP", text: "SPOUSE OF AN E1 (E1)" }, { val: "E1-TR", text: "TREATY TRADER (E1)" }, { val: "E2-CH", text: "CHILD OF AN E2 (E2)" }, { val: "E2-EX", text: "EXECUTIVE/MGR/ESSENTIAL EMP (E2)" }, { val: "E2-SP", text: "SPOUSE OF AN E2 (E2)" }, { val: "E2-TR", text: "TREATY INVESTOR (E2)" }, { val: "E3D-CH", text: "CHILD OF AN E3 (E3D)" }, { val: "E3D-SP", text: "SPOUSE OF AN E3 (E3D)" }],
            "F": [{ val: "F1-F1", text: "STUDENT (F1)" }, { val: "F2-CH", text: "CHILD OF AN F1 (F2)" }, { val: "F2-SP", text: "SPOUSE OF AN F1 (F2)" }],
            "G": [{ val: "G1-CH", text: "CHILD OF A G1 (G1)" }, { val: "G1-G1", text: "PRINCIPAL REPRESENTATIVE (G1)" }, { val: "G1-SP", text: "SPOUSE OF A G1 (G1)" }, { val: "G1-ST", text: "STAFF OF PRINCIPAL REPRESENTATIVE (G1)" }, { val: "G2-CH", text: "CHILD OF A G2 (G2)" }, { val: "G2-RP", text: "REPRESENTATIVE (G2)" }, { val: "G2-SP", text: "SPOUSE OF A G2 (G2)" }, { val: "G3-CH", text: "CHILD OF A G3 (G3)" }, { val: "G3-RP", text: "NON-RECOGNIZED/-MEMBER COUNTRY REP(G3)" }, { val: "G3-SP", text: "SPOUSE OF A G3 (G3)" }, { val: "G4-CH", text: "CHILD OF AN G4 (G4)" }, { val: "G4-G4", text: "INTERNATIONAL ORG. EMPLOYEE (G4)" }, { val: "G4-SP", text: "SPOUSE OF A G4 (G4)" }, { val: "G5-CH", text: "CHILD OF A G5 (G5)" }, { val: "G5-EM", text: "PERSONAL EMP. OF A G1, 2, 3, OR 4 (G5)" }, { val: "G5-SP", text: "SPOUSE OF A G5 (G5)" }],
            "H": [{ val: "H1B-H1B", text: "SPECIALTY OCCUPATION (H1B)" }, { val: "H1B1-CHL", text: "CHILEAN SPEC. OCCUPATION (H1B1)" }, { val: "H1B1-SGP", text: "SINGAPOREAN SPEC. OCCUPATION (H1B1)" }, { val: "H1C-NR", text: "NURSE IN SHORTAGE AREA (H1C)" }, { val: "H2A-AG", text: "AGRICULTURAL WORKER (H2A)" }, { val: "H2B-NA", text: "NONAGRICULTURAL WORKER (H2B)" }, { val: "H3-TR", text: "TRAINEE (H3)" }, { val: "H4-CH", text: "CHILD OF AN H (H4)" }, { val: "H4-SP", text: "SPOUSE OF AN H (H4)" }],
            "I": [{ val: "I-CH", text: "CHILD OF AN I (I)" }, { val: "I-FR", text: "FOREIGN MEDIA REPRESENTATIVE (I)" }, { val: "I-SP", text: "SPOUSE OF AN I (I)" }],
            "J": [{ val: "J1-J1", text: "EXCHANGE VISITOR (J1)" }, { val: "J2-CH", text: "CHILD OF A J1 (J2)" }, { val: "J2-SP", text: "SPOUSE OF A J1 (J2)" }],
            "K": [{ val: "K1-K1", text: "FIANCÃ‰(E) OF A U.S. CITIZEN (K1)" }, { val: "K2-K2", text: "CHILD OF A K1 (K2)" }, { val: "K3-K3", text: "SPOUSE OF A U.S. CITIZEN (K3)" }, { val: "K4-K4", text: "CHILD OF A K3 (K4)" }],
            "L": [{ val: "L1-L1", text: "INTRACOMPANY TRANSFEREE (L1)" }, { val: "L2-CH", text: "CHILD OF A L1 (L2)" }, { val: "L2-SP", text: "SPOUSE OF A L1 (L2)" }],
            "M": [{ val: "M1-M1", text: "STUDENT (M1)" }, { val: "M2-CH", text: "CHILD OF M1 (M2)" }, { val: "M2-SP", text: "SPOUSE OF M1 (M2)" }, { val: "M3-M3", text: "COMMUTER STUDENT (M3)" }],
            "N": [{ val: "N8", text: "PARENT OF SK3 SPL IMMIGRANT (N8)" }, { val: "N9", text: "CHILD OF N8/SK1/SK2/SK4 (N9)" }],
            "NATO": [{ val: "NATO1", text: "PRINCIPAL PERMANENT REP TO NATO (NATO1)" }, { val: "NATO2", text: "OTHER REP TO NATO (NATO2)" }, { val: "NATO3", text: "OFFICIAL CLERICAL STAFF (NATO3)" }, { val: "NATO4", text: "OTHER NATO OFFICIAL (NATO4)" }, { val: "NATO5", text: "EXPERT EMPLOYED BY NATO (NATO5)" }, { val: "NATO6", text: "MEMBER OF CIVILIAN COMPONENT (NATO6)" }, { val: "NATO7", text: "PERSONAL EMP. OF NATO1-6 (NATO7)" }],
            "O": [{ val: "O1", text: "ALIEN WITH EXTRAORDINARY ABILITY (O1)" }, { val: "O2", text: "ACCOMPANYING ALIEN (O2)" }, { val: "O3", text: "SPOUSE OR CHILD OF O1/O2 (O3)" }],
            "P": [{ val: "P1", text: "INTERNATIONALLY RECOGNIZED ALIEN (P1)" }, { val: "P2", text: "ARTIST/ENTERTAINER IN EXCHANGE PROGRAM (P2)" }, { val: "P3", text: "ARTIST/ENTERTAINER IN CULTURALLY UNIQUE PROGRAM (P3)" }, { val: "P4", text: "SPOUSE OR CHILD OF P1/P2/P3 (P4)" }],
            "Q": [{ val: "Q1", text: "CULTURAL EXCHANGE VISITOR (Q1)" }],
            "R": [{ val: "R1", text: "RELIGIOUS WORKER (R1)" }, { val: "R2", text: "SPOUSE OR CHILD OF R1 (R2)" }],
            "S": [{ val: "S5", text: "INFORMANT (S5)" }, { val: "S6", text: "INFORMANT (S6)" }, { val: "S7", text: "SPOUSE OR CHILD OF S5/S6 (S7)" }],
            "T": [{ val: "T1", text: "VICTIM OF TRAFFICKING (T1)" }, { val: "T2", text: "SPOUSE OF T1 (T2)" }, { val: "T3", text: "CHILD OF T1 (T3)" }, { val: "T4", text: "PARENT OF T1 (T4)" }, { val: "T5", text: "SIBLING OF T1 (T5)" }],
            "TD/TN": [{ val: "TN", text: "NAFTA PROFESSIONAL (TN)" }, { val: "TD", text: "SPOUSE OR CHILD OF TN (TD)" }],
            "U": [{ val: "U1", text: "VICTIM OF CRIMINAL ACTIVITY (U1)" }, { val: "U2", text: "SPOUSE OF U1 (U2)" }, { val: "U3", text: "CHILD OF U1 (U3)" }, { val: "U4", text: "PARENT OF U1 (U4)" }, { val: "U5", text: "SIBLING OF U1 (U5)" }],
            "PAROLE-BEN": [{ val: "PARCIS", text: "PAROLE BENEFICIARY (PARCIS)" }]
        };

        function actualizarEspecificar() {
            const propSelect = document.getElementById("purposeOfTrip");
            const specSelect = document.getElementById("specifyPurpose");
            const selectedClass = propSelect.value;

            specSelect.innerHTML = '<option value="" disabled selected>PLEASE SELECT</option>';

            if (visasMap[selectedClass]) {
                visasMap[selectedClass].forEach(opt => {
                    specSelect.innerHTML += `<option value="${opt.val}">${opt.text}</option>`;
                });
                if (visasMap[selectedClass].length > 0) {
                    specSelect.selectedIndex = 1;
                }
            }
        }

        // -----------------------------------------------------------------
        // SECCIÃ“N 4: TRAVEL COMPANIONS
        // -----------------------------------------------------------------
        function actualizarTravelCompanions() {
            const val = document.getElementById('otherPersonsTravelingWithYou').value;
            const divOtros = document.getElementById('divViajaConOtros');
            divOtros.style.display = (val === 'Y') ? 'block' : 'none';
            actualizarGroupTravel();
        }

        function actualizarGroupTravel() {
            const otherPersonsVal = document.getElementById('otherPersonsTravelingWithYou').value;
            const val = document.getElementById('groupTravel').value;
            const divGroupName = document.getElementById('divGroupName');
            const divOtherPersons = document.getElementById('divOtherPersons');

            if (otherPersonsVal === 'Y') {
                if (val === 'Y') {
                    divGroupName.style.display = 'block';
                    divOtherPersons.style.display = 'none';
                } else {
                    divGroupName.style.display = 'none';
                    divOtherPersons.style.display = 'block';
                }
            } else {
                divGroupName.style.display = 'none';
                divOtherPersons.style.display = 'none';
            }
        }

        function agregarAcompanante() {
            const container = document.getElementById('companionsContainer');
            const div = document.createElement('div');
            div.className = 'companion-entry';
            div.style.border = '1px solid #ccc';
            div.style.padding = '10px';
            div.style.marginBottom = '10px';
            div.style.position = 'relative';

            div.innerHTML = `
                <button type="button" onclick="this.parentElement.remove()" style="position:absolute; right:10px; top:10px; background:red; color:white; border:none; cursor:pointer;">X Remove</button>
                <div style="margin-bottom: 10px;">
                    <input type="text" class="comp-surname" placeholder="Surnames">
                </div>
                <div style="margin-bottom: 10px;">
                    <input type="text" class="comp-givenname" placeholder="Given Names">
                </div>
                <div>
                    <select class="comp-relationship">
                        <option value="">- SELECT ONE -</option>
                        <option value="P">PARENT</option>
                        <option value="S">SPOUSE</option>
                        <option value="C">CHILD</option>
                        <option value="R">OTHER RELATIVE</option>
                        <option value="F">FRIEND</option>
                        <option value="B">BUSINESS ASSOCIATE</option>
                        <option value="O">OTHER</option>
                    </select>
                </div>
            `;
            container.appendChild(div);
        }

        // -----------------------------------------------------------------
        // SECCIÃ“N 5: PREVIOUS U.S. TRAVEL (LÃ“GICAS)
        // -----------------------------------------------------------------
        function actualizarPrevUsTravel() {
            const val = document.getElementById('prevUsTravel').value;
            document.getElementById('divPrevUsTravelDetails').style.display = (val === 'Y') ? 'block' : 'none';
        }
        function actualizarPrevUsDriverLic() {
            const val = document.getElementById('hasUsDriverLicense').value;
            document.getElementById('divDriverLicDetails').style.display = (val === 'Y') ? 'block' : 'none';
        }
        function actualizarPrevVisa() {
            const val = document.getElementById('prevVisa').value;
            document.getElementById('divPrevVisaDetails').style.display = (val === 'Y') ? 'block' : 'none';
        }
        function actualizarRefusedVisa() {
            const val = document.getElementById('refusedVisa').value;
            document.getElementById('divRefusedVisaExplain').style.display = (val === 'Y') ? 'block' : 'none';
        }
        function actualizarImmigrantPetition() {
            const val = document.getElementById('immigrantPetition').value;
            document.getElementById('divImmigrantPetitionExplain').style.display = (val === 'Y') ? 'block' : 'none';
        }

        // INICIALIZACIÃ“N
        window.onload = function () {
            actualizarEspecificar();
            actualizarPlanesViaje();
            actualizarQuienPaga();
            actualizarTravelCompanions();
            actualizarGroupTravel();

            actualizarPrevUsTravel();
            actualizarPrevUsDriverLic();
            actualizarPrevVisa();
            actualizarRefusedVisa();
            actualizarImmigrantPetition();

            if (document.getElementById('companionsContainer').children.length === 0) {
                agregarAcompanante();
            }
        };

        // -----------------------------------------------------------------
        // GUARDAR DATOS EN EL ARCHIVO JSON
        // -----------------------------------------------------------------
        function guardarDatos() {
            // S4: Extraer arreglo de acompaÃ±antes
            const companionsArray = [];
            document.querySelectorAll('#companionsContainer .companion-entry').forEach(entry => {
                companionsArray.push({
                    surname: entry.querySelector('.comp-surname').value.trim().toUpperCase(),
                    givenName: entry.querySelector('.comp-givenname').value.trim().toUpperCase(),
                    relationship: entry.querySelector('.comp-relationship').value
                });
            });

            const datos = {
                // S1
                surnames: document.getElementById('surnames').value.trim().toUpperCase(),
                givenNames: document.getElementById('givenNames').value.trim().toUpperCase(),
                nativeName: document.getElementById('nativeName').value,
                nativeNameText: document.getElementById('nativeNameText').value.trim(),
                otherNames: document.getElementById('otherNames').value,
                telecode: document.getElementById('telecode').value,
                gender: document.getElementById('gender').value,
                marital: document.getElementById('marital').value,
                dobDay: document.getElementById('dobDay').value,
                dobMonth: document.getElementById('dobMonth').value,
                dobYear: document.getElementById('dobYear').value,
                pobCity: document.getElementById('pobCity').value.trim(),
                pobState: document.getElementById('pobState').value.trim(),
                pobCountry: document.getElementById('pobCountry').value,

                // S2
                nationality: document.getElementById('nationality').value,
                otherNationality: document.getElementById('otherNationality').value,
                permResidentOther: document.getElementById('permResidentOther').value,
                nationalId: document.getElementById('nationalId').value,
                nationalIdNA: document.getElementById('nationalIdNA').checked,
                ssn: document.getElementById('ssn').value,
                ssnNA: document.getElementById('ssnNA').checked,
                taxId: document.getElementById('taxId').value,
                taxIdNA: document.getElementById('taxIdNA').checked,

                // S3: InformaciÃ³n de Viaje
                purposeOfTrip: document.getElementById('purposeOfTrip').value,
                specifyPurpose: document.getElementById('specifyPurpose').value,
                specificTravelPlans: document.getElementById('specificTravelPlans').value,

                arrivalDay: document.getElementById('arrivalDay').value,
                arrivalMonth: document.getElementById('arrivalMonth').value,
                arrivalYear: document.getElementById('arrivalYear').value,
                stayLength: document.getElementById('stayLength').value,
                stayUnit: document.getElementById('stayUnit').value,

                specificArrivalDay: document.getElementById('specificArrivalDay').value,
                specificArrivalMonth: document.getElementById('specificArrivalMonth').value,
                specificArrivalYear: document.getElementById('specificArrivalYear').value,
                arrivalFlight: document.getElementById('arrivalFlight').value.trim(),
                arrivalCity: document.getElementById('arrivalCity').value.trim(),
                specificDepDay: document.getElementById('specificDepDay').value,
                specificDepMonth: document.getElementById('specificDepMonth').value,
                specificDepYear: document.getElementById('specificDepYear').value,
                departureFlight: document.getElementById('departureFlight').value.trim(),
                departureCity: document.getElementById('departureCity').value.trim(),
                locationsToVisit: document.getElementById('locationsToVisit').value.trim(),

                usStreet1: document.getElementById('usStreet1').value.trim(),
                usStreet2: document.getElementById('usStreet2').value.trim(),
                usCity: document.getElementById('usCity').value.trim(),
                usState: document.getElementById('usState').value,
                usZip: document.getElementById('usZip').value.trim(),

                whoIsPaying: document.getElementById('whoIsPaying').value,

                payerSurname: document.getElementById('payerSurname').value.trim().toUpperCase(),
                payerGivenName: document.getElementById('payerGivenName').value.trim().toUpperCase(),
                payerPhone: document.getElementById('payerPhone').value.trim(),
                payerEmail: document.getElementById('payerEmail').value.trim(),
                payerRelationship: document.getElementById('payerRelationship').value,

                payerOrgName: document.getElementById('payerOrgName').value.trim(),
                payerOrgPhone: document.getElementById('payerOrgPhone').value.trim(),
                payerOrgRelationship: document.getElementById('payerOrgRelationship').value.trim(),

                // S4: Travel Companions
                otherPersonsTravelingWithYou: document.getElementById('otherPersonsTravelingWithYou').value,
                groupTravel: document.getElementById('groupTravel').value,
                groupName: document.getElementById('groupName').value.trim(),
                companions: companionsArray,

                // S5: Previous U.S. Travel
                prevUsTravel: document.getElementById('prevUsTravel').value,
                prevUsVisitDay: document.getElementById('prevUsVisitDay').value,
                prevUsVisitMonth: document.getElementById('prevUsVisitMonth').value,
                prevUsVisitYear: document.getElementById('prevUsVisitYear').value,
                prevUsVisitLOS: document.getElementById('prevUsVisitLOS').value,
                prevUsVisitLOS_CD: document.getElementById('prevUsVisitLOS_CD').value,

                hasUsDriverLicense: document.getElementById('hasUsDriverLicense').value,
                prevUsDriverLicenseNA: document.getElementById('prevUsDriverLicenseNA').checked,
                prevUsDriverLicenseNum: document.getElementById('prevUsDriverLicenseNum').value.trim(),
                prevUsDriverLicenseState: document.getElementById('prevUsDriverLicenseState').value,

                prevVisa: document.getElementById('prevVisa').value,
                prevVisaIssuedDay: document.getElementById('prevVisaIssuedDay').value,
                prevVisaIssuedMonth: document.getElementById('prevVisaIssuedMonth').value,
                prevVisaIssuedYear: document.getElementById('prevVisaIssuedYear').value,
                prevVisaNumberNA: document.getElementById('prevVisaNumberNA').checked,
                prevVisaNumber: document.getElementById('prevVisaNumber').value.trim(),
                sameVisaType: document.getElementById('sameVisaType').value,
                sameCountry: document.getElementById('sameCountry').value,
                tenPrinted: document.getElementById('tenPrinted').value,
                lostVisa: document.getElementById('lostVisa').value,
                cancelledVisa: document.getElementById('cancelledVisa').value,

                refusedVisa: document.getElementById('refusedVisa').value,
                refusedVisaExplain: document.getElementById('refusedVisaExplain').value.trim(),

                immigrantPetition: document.getElementById('immigrantPetition').value,
                immigrantPetitionExplain: document.getElementById('immigrantPetitionExplain').value.trim(),

                // S6: Address & Phone Information
                homeStreet1: document.getElementById('homeStreet1').value.trim(),
                homeStreet2: document.getElementById('homeStreet2').value.trim(),
                homeCity: document.getElementById('homeCity').value.trim(),
                homeState: document.getElementById('homeState').value.trim(),
                homeStateNA: document.getElementById('homeStateNA').checked,
                homeZip: document.getElementById('homeZip').value.trim(),
                homeZipNA: document.getElementById('homeZipNA').checked,
                homeCountry: document.getElementById('homeCountry').value,
                sameMailingAddress: document.getElementById('sameMailingAddress').value,
                primaryPhone: document.getElementById('primaryPhone').value.trim(),
                secondaryPhone: document.getElementById('secondaryPhone').value.trim(),
                secondaryPhoneNA: document.getElementById('secondaryPhoneNA').checked,
                workPhone: document.getElementById('workPhone').value.trim(),
                workPhoneNA: document.getElementById('workPhoneNA').checked,
                emailAddress: document.getElementById('emailAddress').value.trim(),
                otherEmails: document.getElementById('otherEmails').value,

                // S6b: Social Media
                socialMediaPlatform: document.getElementById('socialMediaPlatform').value,
                socialMediaHandle: (document.getElementById('socialMediaHandle') || {value:''}).value.trim(),
                otherSocialMedia: document.getElementById('otherSocialMedia').value,

                // S7: Passport
                passportType: document.getElementById('passportType').value,
                passportNumber: document.getElementById('passportNumber').value.trim().toUpperCase(),
                passportBookNumberNA: (document.getElementById('passportBookNumberNA') || {checked:true}).checked,
                passportBookNumber: (document.getElementById('passportBookNumber') || {value:''}).value.trim(),
                passportIssuedCountry: document.getElementById('passportIssuedCountry').value,
                passportIssuedCity: document.getElementById('passportIssuedCity').value.trim(),
                passportIssuedState: document.getElementById('passportIssuedState').value.trim(),
                passportIssuedCountryRegion: document.getElementById('passportIssuedCountryRegion').value,
                passportIssuedDay: document.getElementById('passportIssuedDay').value,
                passportIssuedMonth: document.getElementById('passportIssuedMonth').value,
                passportIssuedYear: document.getElementById('passportIssuedYear').value,
                passportExpireNA: document.getElementById('passportExpireNA').checked,
                passportExpireDay: document.getElementById('passportExpireDay').value,
                passportExpireMonth: document.getElementById('passportExpireMonth').value,
                passportExpireYear: document.getElementById('passportExpireYear').value,
                lostPassport: document.getElementById('lostPassport').value,

                // S8: U.S. Point of Contact
                pocNameNA: document.getElementById('pocNameNA').checked,
                pocSurname: document.getElementById('pocSurname').value.trim().toUpperCase(),
                pocGivenName: document.getElementById('pocGivenName').value.trim().toUpperCase(),
                pocOrgNA: document.getElementById('pocOrgNA').checked,
                pocOrgName: document.getElementById('pocOrgName').value.trim().toUpperCase(),
                pocRelationship: document.getElementById('pocRelationship').value,
                pocStreet1: document.getElementById('pocStreet1').value.trim(),
                pocStreet2: document.getElementById('pocStreet2').value.trim(),
                pocCity: document.getElementById('pocCity').value.trim(),
                pocState: document.getElementById('pocState').value,
                pocZipCode: document.getElementById('pocZipCode').value.trim(),
                pocPhone: document.getElementById('pocPhone').value.trim(),
                pocEmailNA: document.getElementById('pocEmailNA').checked,
                pocEmail: document.getElementById('pocEmail').value.trim(),

                // S9: Family
                fatherSurnameNA: document.getElementById('fatherSurnameNA').checked,
                fatherSurname: document.getElementById('fatherSurname').value.trim().toUpperCase(),
                fatherGivenNameNA: document.getElementById('fatherGivenNameNA').checked,
                fatherGivenName: document.getElementById('fatherGivenName').value.trim().toUpperCase(),
                fatherDobNA: document.getElementById('fatherDobNA').checked,
                fatherDobDay: document.getElementById('fatherDobDay').value,
                fatherDobMonth: document.getElementById('fatherDobMonth').value,
                fatherDobYear: document.getElementById('fatherDobYear').value,
                fatherInUS: document.getElementById('fatherInUS').value,
                motherSurnameNA: document.getElementById('motherSurnameNA').checked,
                motherSurname: document.getElementById('motherSurname').value.trim().toUpperCase(),
                motherGivenNameNA: document.getElementById('motherGivenNameNA').checked,
                motherGivenName: document.getElementById('motherGivenName').value.trim().toUpperCase(),
                motherDobNA: document.getElementById('motherDobNA').checked,
                motherDobDay: document.getElementById('motherDobDay').value,
                motherDobMonth: document.getElementById('motherDobMonth').value,
                motherDobYear: document.getElementById('motherDobYear').value,
                motherInUS: document.getElementById('motherInUS').value,
                hasImmediateRelativesUS: document.getElementById('hasImmediateRelativesUS').value,
                hasOtherRelativesUS: document.getElementById('hasOtherRelativesUS').value,

                // S10: Work/Education
                primaryOccupation: document.getElementById('primaryOccupation').value,
                explainOtherOccupation: document.getElementById('explainOtherOccupation').value.trim().toUpperCase(),
                empSchName: document.getElementById('empSchName').value.trim().toUpperCase(),
                empSchAddr1: document.getElementById('empSchAddr1').value.trim().toUpperCase(),
                empSchAddr2: document.getElementById('empSchAddr2').value.trim().toUpperCase(),
                empSchCity: document.getElementById('empSchCity').value.trim().toUpperCase(),
                empSchStateNA: document.getElementById('empSchStateNA').checked,
                empSchState: document.getElementById('empSchState').value.trim().toUpperCase(),
                empSchZipNA: document.getElementById('empSchZipNA').checked,
                empSchZip: document.getElementById('empSchZip').value.trim(),
                empSchPhone: document.getElementById('empSchPhone').value.trim(),
                empSchCountry: document.getElementById('empSchCountry').value,
                empStartDateDay: document.getElementById('empStartDateDay').value,
                empStartDateMonth: document.getElementById('empStartDateMonth').value,
                empStartDateYear: document.getElementById('empStartDateYear').value,
                empSalaryNA: document.getElementById('empSalaryNA').checked,
                empSalary: document.getElementById('empSalary').value.trim(),
                empDuties: document.getElementById('empDuties').value.trim().toUpperCase(),
                prevEmployed: document.getElementById('prevEmployed').value,
                prevEmpName: document.getElementById('prevEmpName').value.trim().toUpperCase(),
                prevEmpAddr1: document.getElementById('prevEmpAddr1').value.trim().toUpperCase(),
                prevEmpAddr2: document.getElementById('prevEmpAddr2').value.trim().toUpperCase(),
                prevEmpCity: document.getElementById('prevEmpCity').value.trim().toUpperCase(),
                prevEmpStateNA: document.getElementById('prevEmpStateNA').checked,
                prevEmpState: document.getElementById('prevEmpState').value.trim().toUpperCase(),
                prevEmpZipNA: document.getElementById('prevEmpZipNA').checked,
                prevEmpZip: document.getElementById('prevEmpZip').value.trim(),
                prevEmpCountry: document.getElementById('prevEmpCountry').value,
                prevEmpPhone: document.getElementById('prevEmpPhone').value.trim(),
                prevEmpJobTitle: document.getElementById('prevEmpJobTitle').value.trim().toUpperCase(),
                prevEmpSupervisorSurnameNA: document.getElementById('prevEmpSupervisorSurnameNA').checked,
                prevEmpSupervisorSurname: document.getElementById('prevEmpSupervisorSurname').value.trim().toUpperCase(),
                prevEmpSupervisorGivenNameNA: document.getElementById('prevEmpSupervisorGivenNameNA').checked,
                prevEmpSupervisorGivenName: document.getElementById('prevEmpSupervisorGivenName').value.trim().toUpperCase(),
                prevEmpFromDay: document.getElementById('prevEmpFromDay').value,
                prevEmpFromMonth: document.getElementById('prevEmpFromMonth').value,
                prevEmpFromYear: document.getElementById('prevEmpFromYear').value,
                prevEmpToDay: document.getElementById('prevEmpToDay').value,
                prevEmpToMonth: document.getElementById('prevEmpToMonth').value,
                prevEmpToYear: document.getElementById('prevEmpToYear').value,
                prevEmpDuties: document.getElementById('prevEmpDuties').value.trim().toUpperCase(),
                prevEduc: document.getElementById('prevEduc').value,
                prevEducName: document.getElementById('prevEducName').value.trim().toUpperCase(),
                prevEducAddr1: document.getElementById('prevEducAddr1').value.trim().toUpperCase(),
                prevEducAddr2: document.getElementById('prevEducAddr2').value.trim().toUpperCase(),
                prevEducCity: document.getElementById('prevEducCity').value.trim().toUpperCase(),
                prevEducStateNA: document.getElementById('prevEducStateNA').checked,
                prevEducState: document.getElementById('prevEducState').value.trim().toUpperCase(),
                prevEducZipNA: document.getElementById('prevEducZipNA').checked,
                prevEducZip: document.getElementById('prevEducZip').value.trim(),
                prevEducCountry: document.getElementById('prevEducCountry').value,
                prevEducCourse: document.getElementById('prevEducCourse').value.trim().toUpperCase(),
                prevEducFromDay: document.getElementById('prevEducFromDay').value,
                prevEducFromMonth: document.getElementById('prevEducFromMonth').value,
                prevEducFromYear: document.getElementById('prevEducFromYear').value,
                prevEducToDay: document.getElementById('prevEducToDay').value,
                prevEducToMonth: document.getElementById('prevEducToMonth').value,
                prevEducToYear: document.getElementById('prevEducToYear').value,

                // S11: Additional Work/Education
                belongsToClanTribe: document.getElementById('belongsToClanTribe').value,
                clanTribeName: document.getElementById('clanTribeName').value.trim().toUpperCase(),
                languageName1: document.getElementById('languageName1').value.trim().toUpperCase(),
                countriesVisited: document.getElementById('countriesVisited').value,
                countryVisited1: document.getElementById('countryVisited1').value,
                belongToOrg: document.getElementById('belongToOrg').value,
                orgName1: document.getElementById('orgName1').value.trim().toUpperCase(),
                specializedSkills: document.getElementById('specializedSkills').value,
                specializedSkillsExpl: document.getElementById('specializedSkillsExpl').value.trim().toUpperCase(),
                militaryService: document.getElementById('militaryService').value,
                militaryCountry: document.getElementById('militaryCountry').value,
                militaryBranch: document.getElementById('militaryBranch').value.trim().toUpperCase(),
                militaryRank: document.getElementById('militaryRank').value.trim().toUpperCase(),
                militarySpecialty: document.getElementById('militarySpecialty').value.trim().toUpperCase(),
                militaryFromDay: document.getElementById('militaryFromDay').value,
                militaryFromMonth: document.getElementById('militaryFromMonth').value,
                militaryFromYear: document.getElementById('militaryFromYear').value,
                militaryToDay: document.getElementById('militaryToDay').value,
                militaryToMonth: document.getElementById('militaryToMonth').value,
                militaryToYear: document.getElementById('militaryToYear').value,
                insurgentOrg: document.getElementById('insurgentOrg').value,
                insurgentOrgExpl: document.getElementById('insurgentOrgExpl').value.trim().toUpperCase(),

                // S12: Security Part 1
                sec1Disease: document.getElementById('sec1Disease').value,
                sec1DiseaseExpl: document.getElementById('sec1DiseaseExpl').value.trim(),
                sec1Disorder: document.getElementById('sec1Disorder').value,
                sec1DisorderExpl: document.getElementById('sec1DisorderExpl').value.trim(),
                sec1Druguser: document.getElementById('sec1Druguser').value,
                sec1DruguserExpl: document.getElementById('sec1DruguserExpl').value.trim(),

                // S13: Security Part 2
                sec2Arrested: document.getElementById('sec2Arrested').value,
                sec2ArrestedExpl: document.getElementById('sec2ArrestedExpl').value.trim(),
                sec2Substances: document.getElementById('sec2Substances').value,
                sec2SubstancesExpl: document.getElementById('sec2SubstancesExpl').value.trim(),
                sec2Prostitution: document.getElementById('sec2Prostitution').value,
                sec2ProstitutionExpl: document.getElementById('sec2ProstitutionExpl').value.trim(),
                sec2MoneyLaundering: document.getElementById('sec2MoneyLaundering').value,
                sec2MoneyLaunderingExpl: document.getElementById('sec2MoneyLaunderingExpl').value.trim(),
                sec2Trafficking: document.getElementById('sec2Trafficking').value,
                sec2TraffickingExpl: document.getElementById('sec2TraffickingExpl').value.trim(),
                sec2AssistedTrafficking: document.getElementById('sec2AssistedTrafficking').value,
                sec2AssistedTraffickingExpl: document.getElementById('sec2AssistedTraffickingExpl').value.trim(),
                sec2RelatedTrafficking: document.getElementById('sec2RelatedTrafficking').value,
                sec2RelatedTraffickingExpl: document.getElementById('sec2RelatedTraffickingExpl').value.trim(),

                // S14: Security Part 3
                sec3IllegalActivity: document.getElementById('sec3IllegalActivity').value,
                sec3IllegalActivityExpl: document.getElementById('sec3IllegalActivityExpl').value.trim(),
                sec3TerroristActivity: document.getElementById('sec3TerroristActivity').value,
                sec3TerroristActivityExpl: document.getElementById('sec3TerroristActivityExpl').value.trim(),
                sec3TerroristSupport: document.getElementById('sec3TerroristSupport').value,
                sec3TerroristSupportExpl: document.getElementById('sec3TerroristSupportExpl').value.trim(),
                sec3TerroristOrg: document.getElementById('sec3TerroristOrg').value,
                sec3TerroristOrgExpl: document.getElementById('sec3TerroristOrgExpl').value.trim(),
                sec3TerroristRel: document.getElementById('sec3TerroristRel').value,
                sec3TerroristRelExpl: document.getElementById('sec3TerroristRelExpl').value.trim(),
                sec3Genocide: document.getElementById('sec3Genocide').value,
                sec3GenocideExpl: document.getElementById('sec3GenocideExpl').value.trim(),
                sec3Torture: document.getElementById('sec3Torture').value,
                sec3TortureExpl: document.getElementById('sec3TortureExpl').value.trim(),
                sec3ExViolence: document.getElementById('sec3ExViolence').value,
                sec3ExViolenceExpl: document.getElementById('sec3ExViolenceExpl').value.trim(),
                sec3ChildSoldier: document.getElementById('sec3ChildSoldier').value,
                sec3ChildSoldierExpl: document.getElementById('sec3ChildSoldierExpl').value.trim(),
                sec3ReligiousFreedom: document.getElementById('sec3ReligiousFreedom').value,
                sec3ReligiousFreedomExpl: document.getElementById('sec3ReligiousFreedomExpl').value.trim(),
                sec3PopulationControls: document.getElementById('sec3PopulationControls').value,
                sec3PopulationControlsExpl: document.getElementById('sec3PopulationControlsExpl').value.trim(),
                sec3Transplant: document.getElementById('sec3Transplant').value,
                sec3TransplantExpl: document.getElementById('sec3TransplantExpl').value.trim(),

                // S15: Security Part 4
                sec4ImmigrationFraud: document.getElementById('sec4ImmigrationFraud').value,
                sec4ImmigrationFraudExpl: document.getElementById('sec4ImmigrationFraudExpl').value.trim(),
                sec4Deport: document.getElementById('sec4Deport').value,
                sec4DeportExpl: document.getElementById('sec4DeportExpl').value.trim(),

                // S16: Security Part 5
                sec5ChildCustody: document.getElementById('sec5ChildCustody').value,
                sec5ChildCustodyExpl: document.getElementById('sec5ChildCustodyExpl').value.trim(),
                sec5VotingViolation: document.getElementById('sec5VotingViolation').value,
                sec5VotingViolationExpl: document.getElementById('sec5VotingViolationExpl').value.trim(),
                sec5RenounceExp: document.getElementById('sec5RenounceExp').value,
                sec5RenounceExpExpl: document.getElementById('sec5RenounceExpExpl').value.trim(),

                photoPath: document.getElementById('photoPath').value.trim()
            };


            const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'datos.json';
            a.click();
            URL.revokeObjectURL(url);

            alert('âœ… Archivo datos.json generado con Ã©xito con la SecciÃ³n 5 incluida.');
        }
    
