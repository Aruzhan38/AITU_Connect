document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('profile-form');
    const alertDiv = document.getElementById('form-alert');
    const saveBtn = document.getElementById('save-btn');
    const editBtn = document.getElementById('edit-btn');
    const inputs = form.querySelectorAll('input, select');
    const token = window.AITU_AUTH.getToken();

    if (!token) {
        window.location.href = '/login';
        return;
    }

    function toggleEditMode(isEditing) {
        inputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                input.disabled = !isEditing;
            } else {
                input.readOnly = !isEditing;
            }
        });

        if (isEditing) {
            saveBtn.classList.remove('d-none');
            editBtn.classList.add('d-none');
        } else {
            saveBtn.classList.add('d-none');
            editBtn.classList.remove('d-none');
        }
    }

    async function loadProfileData() {
        const user = await window.AITU_AUTH.fetchMe();
        if (!user) return;

        document.getElementById('name').value = user.name || "";
        document.getElementById('surname').value = user.surname || "";
        document.getElementById('course').value = user.course || 1;
        document.getElementById('major').value = user.major || "";
        document.getElementById('github_url').value = user.github_url || "";
        document.getElementById('lms_url').value = user.lms_url || "";
        document.getElementById('du_url').value = user.du_url || "";

        const userIdDisplay = document.getElementById('displayUserId');
        if (userIdDisplay) userIdDisplay.textContent = user.user_id || user.id || "---";

        const cardName = document.getElementById('cardFullName');
        if (cardName) cardName.textContent = `${user.name || ''} ${user.surname || ''}`.trim() || "User Name";

        const cardMajor = document.getElementById('cardMajor');
        if (cardMajor) cardMajor.textContent = user.major || "Major not set";

        const cardEmail = document.getElementById('cardEmail');
        if (cardEmail) cardEmail.textContent = user.email || "";

        const avatar = document.getElementById('cardAvatar');
        if (avatar) avatar.src = `https://ui-avatars.com/api/?name=${user.name || 'U'}+${user.surname || ''}&background=0D6EFD&color=fff`;

        toggleEditMode(false);
    }

    await loadProfileData();

    if (editBtn) {
        editBtn.addEventListener('click', () => toggleEditMode(true));
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            course: parseInt(document.getElementById('course').value),
            major: document.getElementById('major').value,
            github_url: document.getElementById('github_url').value,
            lms_url: document.getElementById('lms_url').value,
            du_url: document.getElementById('du_url').value,
            email: window.AITU_AUTH.getEmail()
        };

        try {
            const res = await fetch('/api/profile/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alertDiv.className = "alert alert-success d-block";
                alertDiv.textContent = "Saved successfully!";
                await loadProfileData();
                if (window.initNavbar) await window.initNavbar();
                setTimeout(() => alertDiv.classList.add('d-none'), 3000);
            } else {
                alertDiv.className = "alert alert-danger d-block";
                alertDiv.textContent = "Error saving data";
            }
        } catch (err) {
            alertDiv.className = "alert alert-danger d-block";
            alertDiv.textContent = "Connection error";
        }
    });
});