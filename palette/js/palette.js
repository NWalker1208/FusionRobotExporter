var jointOptions = [];

// Used for hiding/showing elements in the following function
function setVisible(element, visible)
{
    element.style.visibility = visible ? '' : 'hidden';
}

// Gets an a single child element that has the class specified
function getElByClass(fieldset, className)
{
    return fieldset.getElementsByClassName(className)[0]
}

// Used for hiding/showing elements in the following function
function setPortView(fieldset, portView)
{
    var motorPorts = Array.from(fieldset.getElementsByClassName('motor-port'));
    var pneumaticPorts = Array.from(fieldset.getElementsByClassName('pneumatic-port'));
    var relayPorts = Array.from(fieldset.getElementsByClassName('relay-port'));

    var toHide = [];
    var toShow = [];

    // Hide ports based on view
    if (portView == "pneumatic")
    {
        toHide = toHide.concat(motorPorts);
        toHide = toHide.concat(relayPorts);
        toShow = toShow.concat(pneumaticPorts);
    }
    else if (portView == "relay")
    {
        toHide = toHide.concat(motorPorts);
        toHide = toHide.concat(pneumaticPorts);
        toShow = toShow.concat(relayPorts);
    }
    else
    {
        toHide = toHide.concat(pneumaticPorts);
        toHide = toHide.concat(relayPorts);
        toShow = toShow.concat(motorPorts);
    }

    for (var i = 0; i < toHide.length; i++)
        toHide[i].style.display = 'none';
    for (var i = 0; i < toShow.length; i++)
        toShow[i].style.display = '';

    getElByClass(fieldset, 'port-signal').value = toShow[0].value;
}

// Prompts the Fusion add-in for joint data
function requestInfoFromFusion()
{
    console.log('Requesting joint info...');
    adsk.fusionSendData('send_joints', '');
}

// Highlight a joint in Fusion
function highlightJoint(jointName)
{
    console.log('Highlighting ' + jointName);
    adsk.fusionSendData('highlight', jointName);
}

// Handles the receiving of data from Fusion
window.fusionJavaScriptHandler =
    {
        handle: function (action, data)
        {
            try
            {
                if (action == 'joints')
                {
                    console.log("Receiving joint info...");
                    console.log(data);
                    jointOptions = processJointDataString(data);
                    displayJointOptions(jointOptions);
                }
                else if (action == 'debugger')
                {
                    debugger;
                }
                else
                {
                    return 'Unexpected command type: ' + action;
                }
            }
            catch (e)
            {
                console.log('Exception while excecuting \"' + action + '\":');
                console.log(e);
            }
            return 'OK';
        }
    };

// Populates the form with joints
function displayJointOptions(joints)
{
    // Delete all existing slots
    var existing = document.getElementsByClassName('joint-config');
    while (existing.length > 0)
        existing[0].parentNode.removeChild(existing[0]);

    // Add slots for given joinst
    var template = jointTemplate;
    var exportForm = document.getElementById('export-settings');

    for (var i = 0; i < joints.length; i++)
    {
        var fieldset = template.cloneNode(true);

        fieldset.id = 'joint-config-' + String(i);

        var jointTitle = getElByClass(fieldset, 'joint-config-legend');
        jointTitle.innerHTML = joints[i].name;
        jointTitle.onclick = function () { highlightJoint(this.innerHTML); };

        // Filter for angular or linear joints
        var angularJointDiv = getElByClass(fieldset, 'angular-joint-div');
        var linearJointDiv = getElByClass(fieldset, 'linear-joint-div');
        var elsToHide = [];

        if ((joints[i].type & JOINT_ANGULAR) != JOINT_ANGULAR)
        {
            elsToHide = elsToHide.concat(Array.from(fieldset.getElementsByClassName('angular-driver')));
            elsToHide.push(angularJointDiv);
        }

        if ((joints[i].type & JOINT_LINEAR) != JOINT_LINEAR)
        {
            elsToHide = elsToHide.concat(Array.from(fieldset.getElementsByClassName('linear-driver')));
            elsToHide.push(linearJointDiv);
        }

        for (var j = 0; j < elsToHide.length; j++)
            elsToHide[j].style.display = 'none';

        // Set joint type
        fieldset.dataset.joint_type = joints[i].type;

        // Show or hide other elements
        updateFieldOptions(fieldset);

        // Add field to form
        exportForm.appendChild(fieldset);
    }
}

// Disable submit button if no name entered
function updateSubmitButton()
{
    var submitButton = document.getElementById('finished-button');
    var name = document.getElementById('name').value;

    document.getElementById('finished-button').disabled = (name.length == 0);
}

// Hides or shows fields based on the values of other fields
function updateFieldOptions(fieldset)
{
    // Get the parent node that is the fieldset
    while (fieldset != null && !fieldset.classList.contains('joint-config'))
        fieldset = fieldset.parentNode;

    if (fieldset == null)
        return;

    // Update view of fieldset
    var driverType = parseInt(getElByClass(fieldset, 'driver-type').value);
    var hasDriverDiv = getElByClass(fieldset, 'has-driver-div');

    if (driverType == 0)
        setVisible(hasDriverDiv, false);
    else
    {
        setVisible(hasDriverDiv, true);

        var jointType = parseInt(fieldset.dataset.joint_type);

        var angularJointDiv = getElByClass(fieldset, 'angular-joint-div');
        var linearJointDiv = getElByClass(fieldset, 'linear-joint-div');

        var genericPortsDiv = getElByClass(fieldset, 'generic-ports-div');
        var portBSelector = getElByClass(fieldset, 'port-number-b');
        setVisible(genericPortsDiv, true);
        setVisible(portBSelector, false);
        
        setPortView(fieldset, 'motor');

        // Angular Joint Info
        if ((jointType & JOINT_ANGULAR) == JOINT_ANGULAR)
        {
            if (driverType == DRIVER_DUAL_MOTOR)
                setVisible(portBSelector, true);

            // Wheel Info
            var selectedWheel = parseInt(getElByClass(fieldset, 'wheel-type').value);
            var hasWheelDiv = getElByClass(fieldset, 'has-wheel-div');

            if (selectedWheel == 0)
            {
                setVisible(hasWheelDiv, false);
                setVisible(linearJointDiv, true);
            }
            else
            {
                setVisible(hasWheelDiv, true);
                setVisible(linearJointDiv, false);

                // Drive wheel
                var isDriveWheel = getElByClass(fieldset, 'is-drive-wheel').checked;
                var driveWheelPortsDiv = getElByClass(fieldset, 'drive-wheel-ports-div');
                
                if (!isDriveWheel)
                    setVisible(driveWheelPortsDiv, false);
                else
                {
                    setVisible(driveWheelPortsDiv, true);
                    setVisible(genericPortsDiv, false);
                }
            }
        }

        // Linear Joint Info
        if ((jointType & JOINT_LINEAR) == JOINT_LINEAR)
        {
            // Pneumatic Info
            var pneumaticDiv = getElByClass(fieldset, 'pneumatic-div');

            if (driverType != DRIVER_BUMPER_PNEUMATIC &&
                driverType != DRIVER_RELAY_PNEUMATIC)
            {
                setVisible(pneumaticDiv, false);
                setVisible(angularJointDiv, true);
            }
            else
            {
                if (driverType == DRIVER_BUMPER_PNEUMATIC)
                {
                    setVisible(portBSelector, true);
                    setPortView(fieldset, 'pneumatic');
                }
                else
                    setPortView(fieldset, 'relay');

                setVisible(pneumaticDiv, true);
                setVisible(angularJointDiv, false);
            }
        }
    }
}

// Updates jointOptions with the currently entered data
function readFormData()
{
    for (var i = 0; i < jointOptions.length; i++)
    {
        var fieldset = document.getElementById('joint-config-' + String(i));

        var selectedDriver = parseInt(fieldset.getElementsByClassName('driver-type')[0].value);

        if (selectedDriver > 0)
        {
            var signal = parseInt(getElByClass(fieldset, 'port-signal').querySelector('option:checked').dataset.portValue);
            var portA = parseInt(getElByClass(fieldset, 'port-number-a').value);
            var portB = parseInt(getElByClass(fieldset, 'port-number-b').value);

            jointOptions[i].driver = createDriver(selectedDriver, signal, portA, portB);
            jointOptions[i].driver.signal = signal;
            jointOptions[i].driver.portA = portA;
            jointOptions[i].driver.portB = portB;

            if ((jointOptions[i].type & JOINT_ANGULAR) == JOINT_ANGULAR)
            {
                var selectedWheel = parseInt(getElByClass(fieldset, 'wheel-type').value);

                if (selectedWheel > 0)
                {
                    var isDriveWheel = getElByClass(fieldset, 'is-drive-wheel').checked;
                    jointOptions[i].driver.wheel = createWheel(selectedWheel, FRICTION_MEDIUM, isDriveWheel);

                    if (isDriveWheel)
                    {
                        jointOptions[i].driver.signal = PWM;
                        jointOptions[i].driver.portA = parseInt(getElByClass(fieldset, 'wheel-side').value);
                        jointOptions[i].driver.portB = parseInt(getElByClass(fieldset, 'wheel-side').value);
                    }
                }
            }

            if ((jointOptions[i].type & JOINT_LINEAR) == JOINT_LINEAR)
            {
                if (selectedDriver == DRIVER_BUMPER_PNEUMATIC ||
                    selectedDriver == DRIVER_RELAY_PNEUMATIC)
                {
                    var width = parseInt(getElByClass(fieldset, 'pneumatic-width').value);
                    var pressure = parseInt(getElByClass(fieldset, 'pneumatic-pressure').value);

                    jointOptions[i].driver.pneumatic = createPneumatic(width, pressure);
                }
            }
        }
    }
}

// Sends the data to the Fusion add-in
function sendInfoToFusion()
{
    var name = document.getElementById('name').value;

    if (name.length == 0)
    {
        alert("Please enter a name.");
        return;
    }

    readFormData();
    adsk.fusionSendData('export', stringifyConfigData(name, jointOptions));
}
