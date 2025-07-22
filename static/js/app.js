class FrameworkGenerator {
    constructor() {
        this.selectedType = null;
        this.currentFramework = null;
        this.frameworkTypes = {};
        this.init();
    }

    init() {
        this.loadFrameworkTypes();
        this.loadExamples();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Framework form submission
        document.getElementById('frameworkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateFramework();
        });

        // Regenerate button
        document.getElementById('regenerateBtn').addEventListener('click', () => {
            this.showForm();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportFramework();
        });

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on outside click
        document.getElementById('frameworkModal').addEventListener('click', (e) => {
            if (e.target.id === 'frameworkModal') {
                this.closeModal();
            }
        });
    }

    async loadFrameworkTypes() {
        try {
            const response = await fetch('/api/framework-types');
            this.frameworkTypes = await response.json();
            this.renderFrameworkTypes();
        } catch (error) {
            console.error('Error loading framework types:', error);
            this.showError('Failed to load framework types');
        }
    }

    renderFrameworkTypes() {
        const container = document.getElementById('frameworkTypes');
        container.innerHTML = '';

        // Framework type icons mapping
        const typeIcons = {
            'linear': 'fas fa-arrow-right',
            'non_linear': 'fas fa-th',
            'cyclical': 'fas fa-sync-alt',
            'hierarchical': 'fas fa-layer-group',
            'matrix': 'fas fa-border-all'
        };

        Object.entries(this.frameworkTypes).forEach(([type, info]) => {
            const card = document.createElement('div');
            card.className = 'framework-type-card';
            card.dataset.type = type;
            
            card.innerHTML = `
                <i class="card-icon ${typeIcons[type] || 'fas fa-cog'}"></i>
                <h3 class="card-title">${info.name}</h3>
                <p class="card-description">${info.description}</p>
                <ul class="card-characteristics">
                    ${info.characteristics.map(char => `<li>${char}</li>`).join('')}
                </ul>
                <div style="margin-top: 1rem;">
                    <small><strong>${info.ideal_steps}</strong></small>
                </div>
            `;

            card.addEventListener('click', () => {
                this.selectFrameworkType(type, card);
            });

            container.appendChild(card);
        });
    }

    selectFrameworkType(type, cardElement) {
        // Remove previous selection
        document.querySelectorAll('.framework-type-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        cardElement.classList.add('selected');
        this.selectedType = type;

        // Show the input form
        setTimeout(() => {
            this.showForm();
        }, 300);
    }

    showForm() {
        const form = document.getElementById('inputForm');
        const results = document.getElementById('results');
        
        // Hide results if showing
        results.style.display = 'none';
        
        // Show form with animation
        form.style.display = 'block';
        form.classList.add('fade-in');
        
        // Smooth scroll to form
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async generateFramework() {
        if (!this.selectedType) {
            this.showError('Please select a framework type first');
            return;
        }

        const formData = new FormData(document.getElementById('frameworkForm'));
        const data = {
            type: this.selectedType,
            industry: formData.get('industry'),
            purpose: formData.get('purpose'),
            target_audience: formData.get('targetAudience'),
            complexity: formData.get('complexity')
        };

        // Show loading state
        this.showLoading();

        try {
            const response = await fetch('/api/generate-framework', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const framework = await response.json();
            console.log('Framework received:', framework);
            
            // Ensure arrays are properly formatted
            if (typeof framework.best_practices === 'string') {
                framework.best_practices = [framework.best_practices];
            }
            if (typeof framework.pitfalls === 'string') {
                framework.pitfalls = [framework.pitfalls];
            }
            
            this.currentFramework = framework;
            this.displayFramework(framework);
        } catch (error) {
            console.error('Error generating framework:', error);
            this.showError('Failed to generate framework. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('inputForm').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('loadingState').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
    }

    displayFramework(framework) {
        const container = document.getElementById('frameworkOutput');
        const resultsSection = document.getElementById('results');

        // Framework header
        const headerHTML = `
            <div class="framework-header">
                <h1 class="framework-title">${framework.name}</h1>
                <span class="framework-type-badge">${this.frameworkTypes[framework.type].name} Framework</span>
                <p class="framework-description">${framework.description}</p>
            </div>
        `;

        // Framework elements
        const elementsHTML = `
            <div class="framework-elements">
                ${framework.elements.map((element, index) => `
                    <div class="element-card">
                        <div class="element-number">${index + 1}</div>
                        <h3 class="element-name">${element.name}</h3>
                        <p class="element-description">${element.description}</p>
                        
                        <div class="element-activities">
                            <h4><i class="fas fa-tasks"></i> Key Activities</h4>
                            <ul>
                                ${Array.isArray(element.activities) ? 
                                    element.activities.map(activity => `<li>${activity}</li>`).join('') :
                                    `<li>${element.activities}</li>`
                                }
                            </ul>
                        </div>
                        
                        <div class="element-success">
                            <h4><i class="fas fa-trophy"></i> Success Criteria</h4>
                            <p>${element.success_criteria}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Meta information
        const metaHTML = `
            <div class="framework-meta">
                <div class="meta-card">
                    <h3><i class="fas fa-lightbulb"></i> When to Use</h3>
                    <p>${framework.when_to_use}</p>
                </div>
                
                <div class="meta-card">
                    <h3><i class="fas fa-check-circle"></i> Best Practices</h3>
                    <ul>
                        ${Array.isArray(framework.best_practices) ? 
                            framework.best_practices.map(practice => `<li>${practice}</li>`).join('') :
                            `<li>${framework.best_practices}</li>`
                        }
                    </ul>
                </div>
                
                <div class="meta-card">
                    <h3><i class="fas fa-exclamation-triangle"></i> Common Pitfalls</h3>
                    <ul>
                        ${Array.isArray(framework.pitfalls) ? 
                            framework.pitfalls.map(pitfall => `<li>${pitfall}</li>`).join('') :
                            `<li>${framework.pitfalls}</li>`
                        }
                    </ul>
                </div>
                
                <div class="meta-card">
                    <h3><i class="fas fa-brain"></i> Psychology</h3>
                    <p>${framework.psychology_principle}</p>
                </div>
                
                <div class="meta-card">
                    <h3><i class="fas fa-eye"></i> Visual Concept</h3>
                    <p>${framework.visual_concept}</p>
                </div>
            </div>
        `;

        container.innerHTML = headerHTML + elementsHTML + metaHTML;
        
        // Show results
        resultsSection.style.display = 'block';
        resultsSection.classList.add('slide-up');
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async loadExamples() {
        try {
            const response = await fetch('/api/examples');
            const examples = await response.json();
            this.renderExamples(examples);
        } catch (error) {
            console.error('Error loading examples:', error);
        }
    }

    renderExamples(examples) {
        const container = document.getElementById('examplesGrid');
        container.innerHTML = '';

        Object.entries(examples).forEach(([type, example]) => {
            const card = document.createElement('div');
            card.className = 'example-card';
            
            card.innerHTML = `
                <h3 class="example-title">${example.name}</h3>
                <div class="example-elements">
                    ${example.elements.map(element => 
                        `<span class="example-element">${element}</span>`
                    ).join('')}
                </div>
            `;

            card.addEventListener('click', () => {
                this.showExampleDetails(type, example);
            });

            container.appendChild(card);
        });
    }

    showExampleDetails(type, example) {
        const modalBody = document.getElementById('modalBody');
        const frameworkInfo = this.frameworkTypes[type];
        
        modalBody.innerHTML = `
            <h2>${example.name}</h2>
            <div style="margin-bottom: 2rem;">
                <span class="framework-type-badge">${frameworkInfo.name} Framework</span>
                <p style="margin-top: 1rem;">${frameworkInfo.description}</p>
            </div>
            
            <h3>Framework Elements:</h3>
            <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                ${example.elements.map((element, index) => `
                    <div style="background: #f7fafc; padding: 1rem; border-radius: 8px; border-left: 4px solid #667eea;">
                        <strong>${index + 1}. ${element}</strong>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 2rem;">
                <h4>Characteristics:</h4>
                <ul style="margin-top: 0.5rem;">
                    ${frameworkInfo.characteristics.map(char => `<li>${char}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-top: 1rem;">
                <strong>Ideal Structure:</strong> ${frameworkInfo.ideal_steps}
            </div>
        `;
        
        document.getElementById('frameworkModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('frameworkModal').style.display = 'none';
    }

    exportFramework() {
        if (!this.currentFramework) {
            this.showError('No framework to export');
            return;
        }

        const exportData = {
            ...this.currentFramework,
            generated_at: new Date().toISOString(),
            framework_type_info: this.frameworkTypes[this.currentFramework.type]
        };

        // Create downloadable JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.currentFramework.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_framework.json`;
        link.click();

        // Also create a formatted text version
        setTimeout(() => {
            const textContent = this.formatFrameworkAsText(this.currentFramework);
            const textBlob = new Blob([textContent], { type: 'text/plain' });
            
            const textLink = document.createElement('a');
            textLink.href = URL.createObjectURL(textBlob);
            textLink.download = `${this.currentFramework.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_framework.txt`;
            textLink.click();
        }, 500);
    }

    formatFrameworkAsText(framework) {
        const typeInfo = this.frameworkTypes[framework.type];
        
        let text = `${framework.name}\n`;
        text += `${typeInfo.name} Framework\n`;
        text += `${'='.repeat(framework.name.length + typeInfo.name.length + 11)}\n\n`;
        
        text += `Description: ${framework.description}\n\n`;
        
        text += `Framework Elements:\n`;
        text += `-----------------\n`;
        framework.elements.forEach((element, index) => {
            text += `\n${index + 1}. ${element.name}\n`;
            text += `   ${element.description}\n`;
            text += `   
   Key Activities:\n`;
            const activities = Array.isArray(element.activities) ? element.activities : [element.activities];
            activities.forEach(activity => {
                text += `   • ${activity}\n`;
            });
            text += `   
   Success Criteria: ${element.success_criteria}\n`;
        });
        
        text += `\n\nImplementation Guidance:\n`;
        text += `------------------------\n`;
        text += `When to Use: ${framework.when_to_use}\n\n`;
        
        text += `Best Practices:\n`;
        const practices = Array.isArray(framework.best_practices) ? framework.best_practices : [framework.best_practices];
        practices.forEach(practice => {
            text += `• ${practice}\n`;
        });
        
        text += `\nCommon Pitfalls:\n`;
        const pitfalls = Array.isArray(framework.pitfalls) ? framework.pitfalls : [framework.pitfalls];
        pitfalls.forEach(pitfall => {
            text += `• ${pitfall}\n`;
        });
        
        text += `\nPsychological Foundation:\n`;
        text += `${framework.psychology_principle}\n`;
        
        text += `\nVisual Concept:\n`;
        text += `${framework.visual_concept}\n`;
        
        text += `\n\nGenerated by AI SYSTEM GENERATOR\n`;
        text += `Generated on: ${new Date().toLocaleDateString()}\n`;
        
        return text;
    }

    showError(message) {
        // Create or update error toast
        let errorToast = document.getElementById('errorToast');
        if (!errorToast) {
            errorToast = document.createElement('div');
            errorToast.id = 'errorToast';
            errorToast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e53e3e;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 1001;
                max-width: 400px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(errorToast);
        }
        
        errorToast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (errorToast.parentNode) {
                errorToast.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create success toast
        const successToast = document.createElement('div');
        successToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #38a169;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1001;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        successToast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(successToast);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            if (successToast.parentNode) {
                successToast.remove();
            }
        }, 3000);
    }
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FrameworkGenerator();
}); 