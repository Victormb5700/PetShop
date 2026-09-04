const API = "/api";
let datePicker;

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach((el) => el.classList.remove("active"));

    document.getElementById(`screen-${screen}`).classList.add("active");
    document.getElementById(`nav-${screen}`).classList.add("active");

    if (screen === "list") loadAppointments();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDateTime(mysqlDate) {
    if (!mysqlDate) return "";
    const date = new Date(mysqlDate);
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

function toMysqlDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function toPickerDate(mysqlDate) {
    if (!mysqlDate) return null;
    return new Date(mysqlDate);
}

function escapeHtml(text = "") {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadAppointments() {
    const container = document.getElementById("appointments-container");
    const search = document.getElementById("search")?.value.trim() || "";
    const especie = document.getElementById("species-filter")?.value || "";
    const data = document.getElementById("date-filter")?.value || "";

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (especie) params.set("especie", especie);
    if (data) params.set("data", data);

    container.innerHTML = '<div class="loading">Carregando agendamentos...</div>';

    try {
        const res = await fetch(`${API}/agendamentos?${params.toString()}`);
        if (!res.ok) throw new Error("Falha ao carregar");
        const appointments = await res.json();

        document.getElementById("appointment-count").textContent =
            `${appointments.length} ${appointments.length === 1 ? "agendamento" : "agendamentos"}`;

        if (!appointments.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <b>Nenhum agendamento encontrado.</b>
                    <span>Cadastre um novo horário ou altere os filtros da busca.</span>
                </div>`;
            return;
        }

        container.innerHTML = appointments.map((a) => `
            <article class="appointment-card">
                <div class="card-top">
                    <div class="pet-title">
                        <span class="pet-avatar">${a.especie === "Gato" ? "🐱" : "🐶"}</span>
                        <div>
                            <h3>${escapeHtml(a.nome_pet)}</h3>
                            <p>Tutor: ${escapeHtml(a.nome_tutor)}</p>
                        </div>
                    </div>
                    <span class="species-badge">${escapeHtml(a.especie)}</span>
                </div>

                <div class="card-details">
                    <div class="detail-row"><span>Serviço</span><strong>${escapeHtml(a.servico)}</strong></div>
                    <div class="detail-row"><span>Data e hora</span><strong>${formatDateTime(a.data_hora)}</strong></div>
                </div>

                <p class="observation">${a.observacao ? escapeHtml(a.observacao) : "Sem observações."}</p>

                <div class="card-actions">
                    <button class="edit" onclick="editAppointment(${a.id})">Editar</button>
                    <button class="delete" onclick="deleteAppointment(${a.id})">Excluir</button>
                </div>
            </article>
        `).join("");
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <b>Não foi possível acessar o backend.</b>
                <span>Confira se o Node.js está rodando e se o banco petshop foi importado.</span>
            </div>`;
    }
}

async function saveAppointment(event) {
    event.preventDefault();
    const id = document.getElementById("appointment-id").value;
    const especie = document.querySelector('input[name="especie"]:checked').value;
    const selectedDate = datePicker.selectedDates[0];

    const data = {
        nome_pet: document.getElementById("nome_pet").value.trim(),
        nome_tutor: document.getElementById("nome_tutor").value.trim(),
        especie,
        servico: document.getElementById("servico").value,
        data_hora: toMysqlDateTime(selectedDate),
        observacao: document.getElementById("observacao").value.trim(),
    };

    if (!selectedDate) {
        return setFormMessage("Selecione o dia e o horário do agendamento.", "error");
    }

    try {
        const res = await fetch(id ? `${API}/agendamentos/${id}` : `${API}/agendamentos`, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();

        if (!res.ok) {
            return setFormMessage(result.error || "Não foi possível salvar.", "error");
        }

        resetForm();
        showToast(id ? "Agendamento atualizado." : "Agendamento confirmado.");
        showScreen("list");
    } catch (error) {
        setFormMessage("Erro de conexão com o backend.", "error");
    }
}

async function editAppointment(id) {
    try {
        const res = await fetch(`${API}/agendamentos/${id}`);
        const a = await res.json();
        if (!res.ok) throw new Error(a.error);

        document.getElementById("appointment-id").value = a.id;
        document.getElementById("nome_pet").value = a.nome_pet;
        document.getElementById("nome_tutor").value = a.nome_tutor;
        document.querySelector(`input[name="especie"][value="${a.especie}"]`).checked = true;
        document.getElementById("servico").value = a.servico;
        document.getElementById("observacao").value = a.observacao || "";
        document.getElementById("obs-count").textContent = (a.observacao || "").length;
        datePicker.setDate(toPickerDate(a.data_hora), true);

        document.getElementById("form-title").textContent = "Editar agendamento";
        document.getElementById("submit-text").textContent = "Salvar alterações";
        document.getElementById("cancel-edit").classList.remove("hidden");
        showScreen("schedule");
    } catch (error) {
        showToast("Não foi possível abrir o agendamento.");
    }
}

async function deleteAppointment(id) {
    if (!confirm("Deseja realmente excluir este agendamento?")) return;

    try {
        const res = await fetch(`${API}/agendamentos/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Erro ao excluir");
        showToast("Agendamento excluído.");
        loadAppointments();
    } catch (error) {
        showToast("Não foi possível excluir.");
    }
}

function resetForm() {
    document.getElementById("appointment-form").reset();
    document.getElementById("appointment-id").value = "";
    document.getElementById("form-title").textContent = "Marcar agendamento";
    document.getElementById("submit-text").textContent = "Confirmar agendamento";
    document.getElementById("cancel-edit").classList.add("hidden");
    document.getElementById("form-message").className = "message hidden";
    document.getElementById("obs-count").textContent = "0";
    datePicker.clear();
}

function cancelEdit() {
    resetForm();
}

function newAppointment() {
    resetForm();
    showScreen("schedule");
}

function clearFilters() {
    document.getElementById("search").value = "";
    document.getElementById("species-filter").value = "";
    document.getElementById("date-filter").value = "";
    loadAppointments();
}

function setFormMessage(text, type) {
    const el = document.getElementById("form-message");
    el.textContent = text;
    el.className = `message ${type}`;
}

function showToast(text) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("DOMContentLoaded", () => {
    datePicker = flatpickr("#data_hora", {
        enableTime: true,
        time_24hr: true,
        minuteIncrement: 15,
        minDate: "today",
        dateFormat: "Y-m-d H:i",
        altInput: true,
        altFormat: "d/m/Y • H:i",
        locale: "pt",
        disableMobile: true,
    });

    document.getElementById("observacao").addEventListener("input", (e) => {
        document.getElementById("obs-count").textContent = e.target.value.length;
    });
});
