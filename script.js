        function createFloatingHearts() {
            const heartsContainer = document.getElementById('floatingHearts');
            const heartCount = 15;
            
            for (let i = 0; i < heartCount; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.innerHTML = '❤';
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.animationDelay = Math.random() * 6 + 's';
                heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
                heartsContainer.appendChild(heart);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            createFloatingHearts();
            
            const studyForm = document.getElementById('studyForm');
            const scheduleDisplay = document.getElementById('scheduleDisplay');
            const dayButtons = document.querySelectorAll('.day-btn');
            let studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
            let currentFilter = 'all';
            
            // Display existing sessions
            displaySessions();
            
            // Form submission
            studyForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const subject = document.getElementById('subject').value;
                const topic = document.getElementById('topic').value;
                const day = document.getElementById('day').value;
                const time = document.getElementById('time').value;
                const duration = document.getElementById('duration').value;
                const priority = document.getElementById('priority').value;
                const notes = document.getElementById('notes').value;
                
                const session = {
                    id: Date.now(),
                    subject,
                    topic,
                    day,
                    time,
                    duration,
                    priority,
                    notes
                };
                
                studySessions.push(session);
                localStorage.setItem('studySessions', JSON.stringify(studySessions));
                
                displaySessions();
                studyForm.reset();
                
                // Show success message with a personal touch
                showCustomAlert('Study session added successfully! 🎉', 'success');
            });
            
            // Day filtering
            dayButtons.forEach(button => {
                button.addEventListener('click', function() {
                    dayButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.getAttribute('data-day');
                    displaySessions();
                });
            });
            
            function displaySessions() {
                if (studySessions.length === 0) {
                    scheduleDisplay.innerHTML = `
                        <div class="empty-state">
                            <i>📚</i>
                            <p>No study sessions planned yet. Add your first session!</p>
                        </div>
                    `;
                    return;
                }
                
                let filteredSessions = studySessions;
                if (currentFilter !== 'all') {
                    filteredSessions = studySessions.filter(session => session.day === currentFilter);
                }
                
                // Sort sessions by day and time
                const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                filteredSessions.sort((a, b) => {
                    if (a.day !== b.day) {
                        return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
                    }
                    return a.time.localeCompare(b.time);
                });
                
                if (filteredSessions.length === 0) {
                    scheduleDisplay.innerHTML = `
                        <div class="empty-state">
                            <i>📅</i>
                            <p>No study sessions scheduled for ${currentFilter}.</p>
                        </div>
                    `;
                    return;
                }
                
                scheduleDisplay.innerHTML = filteredSessions.map(session => `
                    <div class="schedule-card">
                        <div class="subject">${session.subject}</div>
                        <div class="time">${session.day} at ${formatTime(session.time)} for ${sessionDurationText(session.duration)}</div>
                        <div class="topic">${session.topic || 'No specific topic'}</div>
                        <div class="priority priority-${session.priority}">${session.priority.toUpperCase()} PRIORITY</div>
                        ${session.notes ? `<div class="notes">${session.notes}</div>` : ''}
                        <button onclick="deleteSession(${session.id})" style="margin-top:10px; background:#ff4757; font-size:12px; padding:5px 10px;">Delete</button>
                    </div>
                `).join('');
            }
            
            function formatTime(time) {
                const [hours, minutes] = time.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            }
            
            function sessionDurationText(duration) {
                const hours = parseFloat(duration);
                if (hours === 1) return '1 hour';
                return `${hours} hours`;
            }

            function showCustomAlert(message, type) {
                // Create a custom alert element
                const alertDiv = document.createElement('div');
                alertDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${type === 'success' ? '#4CAF50' : '#ff4757'};
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                    max-width: 300px;
                `;
                
                alertDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2em;">${type === 'success' ? '✅' : '⚠️'}</span>
                        <span>${message}</span>
                    </div>
                `;
                
                document.body.appendChild(alertDiv);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    alertDiv.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => {
                        document.body.removeChild(alertDiv);
                    }, 300);
                }, 3000);
            }

            // Add CSS for animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            
            window.deleteSession = function(id) {
                if (confirm('Are you sure you want to delete this study session?')) {
                    studySessions = studySessions.filter(session => session.id !== id);
                    localStorage.setItem('studySessions', JSON.stringify(studySessions));
                    displaySessions();
                    showCustomAlert('Session deleted successfully!', 'success');
                }
            };
        });