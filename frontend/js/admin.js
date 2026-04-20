$(document).ready(function () {
    const API_BASE = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userName = currentUser.name || localStorage.getItem('name') || 'Super Admin';
    let auditLogs = [];

    if (!token || userRole !== 'super_admin') {
        alert('Session expired or unauthorized. Please login again.');
        window.location.href = 'index.html';
        return;
    }

    $('#adminName').text(`- ${userName}`);

    function withAuth() {
        return {
            Authorization: 'Bearer ' + token
        };
    }

    function formatDate(value) {
        if (!value) return '--';
        const date = new Date(value);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    function getOutcomeChip(outcome) {
        const tone = outcome === 'SUCCESS' ? 'success' : outcome === 'DENIED' ? 'denied' : 'failure';
        return `<span class="chip ${tone}">${outcome}</span>`;
    }

    function getAccessChip(accessType) {
        const writeTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SYSTEM'];
        const tone = writeTypes.includes(accessType) ? 'write' : 'read';
        return `<span class="chip ${tone}">${accessType}</span>`;
    }

    function populateDynamicFilters(logs) {
        const actions = [...new Set(logs.map(log => log.action).filter(Boolean))].sort();
        const entities = [...new Set(logs.map(log => log.entityType).filter(Boolean))].sort();

        $('#actionFilter').html('<option value="">All Actions</option>' + actions.map(action => `<option value="${action}">${action}</option>`).join(''));
        $('#entityFilter').html('<option value="">All Entities</option>' + entities.map(entity => `<option value="${entity}">${entity}</option>`).join(''));
    }

    function updateStats(logs) {
        $('#totalEvents').text(logs.length);
        $('#patientActions').text(logs.filter(log => log.entityType === 'Patient').length);
        $('#loginEvents').text(logs.filter(log => log.accessType === 'LOGIN').length);
        $('#failedEvents').text(logs.filter(log => log.outcome === 'FAILURE' || log.outcome === 'DENIED').length);
    }

    function renderAuditTable(logs) {
        const $body = $('#auditTableBody');

        if (!logs.length) {
            $body.html('<tr><td colspan="10" class="empty-state">No audit events match the current filters.</td></tr>');
            return;
        }

        const rows = logs.map((log, index) => {
            const details = log.details || {};
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(log.createdAt)}</td>
                    <td>${log.action || '--'}</td>
                    <td>${getAccessChip(log.accessType || 'SYSTEM')}</td>
                    <td>${getOutcomeChip(log.outcome || 'SUCCESS')}</td>
                    <td>${log.isPhiAccess ? 'Yes' : 'No'}</td>
                    <td>${log.userRole || '--'}</td>
                    <td>${log.entityType || '--'}</td>
                    <td>${log.entityId || '--'}</td>
                    <td>${details.path || '--'}</td>
                </tr>
            `;
        }).join('');

        $body.html(rows);
    }

    function getFilterParams() {
        const params = {};

        [
            ['action', '#actionFilter'],
            ['accessType', '#accessTypeFilter'],
            ['outcome', '#outcomeFilter'],
            ['entityType', '#entityFilter'],
            ['userRole', '#userRoleFilter'],
            ['fromDate', '#fromDate'],
            ['toDate', '#toDate']
        ].forEach(([key, selector]) => {
            const value = $(selector).val();
            if (value) params[key] = value;
        });

        return params;
    }

    function loadAuditTrails() {
        $.ajax({
            url: `${API_BASE}/audit-logs`,
            type: 'GET',
            data: getFilterParams(),
            headers: withAuth(),
            success: function (res) {
                auditLogs = res.logs || [];
                populateDynamicFilters(auditLogs);
                updateStats(auditLogs);
                renderAuditTable(auditLogs);
            },
            error: function (xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Failed to load audit trails';
                alert(msg);
                if (xhr.status === 401) window.location.href = 'index.html';
            }
        });
    }

    function showAuditPanel() {
        $('#staffPanel').addClass('hidden');
        $('#auditPanel').removeClass('hidden');
        $('#showAuditBtn').addClass('hidden');
        $('#showStaffBtn, #refreshAuditBtn').removeClass('hidden');
        loadAuditTrails();
    }

    function showStaffPanel() {
        $('#auditPanel').addClass('hidden');
        $('#staffPanel').removeClass('hidden');
        $('#showStaffBtn, #refreshAuditBtn').addClass('hidden');
        $('#showAuditBtn').removeClass('hidden');
    }

    $('#addStaffForm').on('submit', function (e) {
        e.preventDefault();

        const $btn = $('#submitBtn');
        $btn.prop('disabled', true).text('Working...');

        const staffData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#staffEmail').val(),
            role: $('#staffRole').val(),
            specialist: $('#specialist').val()
        };

        $.ajax({
            url: `${API_BASE}/users/add-staff`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(staffData),
            headers: withAuth(),
            success: function (res) {
                $('#displayId').text(res.credentials.uniqueId);
                $('#displayPass').text(res.credentials.password);
                $('#credentialsDisplay').fadeIn();
                $('#addStaffForm')[0].reset();
                $('#specialistGroup').show();
                $btn.prop('disabled', false).text('Generate Access Credentials');
            },
            error: function (xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Connection failed';
                alert('Security Alert: ' + msg);
                $btn.prop('disabled', false).text('Generate Access Credentials');
                if (xhr.status === 401) window.location.href = 'index.html';
            }
        });
    });

    $('#staffRole').on('change', function () {
        if ($(this).val() === 'doctor') {
            $('#specialistGroup').slideDown();
        } else {
            $('#specialistGroup').slideUp();
            $('#specialist').val('');
        }
    }).trigger('change');

    $('#showAuditBtn').on('click', showAuditPanel);
    $('#showStaffBtn').on('click', showStaffPanel);
    $('#refreshAuditBtn, #applyAuditFilters').on('click', loadAuditTrails);
    $('#clearAuditFilters').on('click', function () {
        $('#actionFilter, #accessTypeFilter, #outcomeFilter, #entityFilter, #userRoleFilter, #fromDate, #toDate').val('');
        loadAuditTrails();
    });

    $('#logoutBtn').on('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    loadAuditTrails();
});
