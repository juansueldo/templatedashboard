function dashboardApp() {
    return {
        sidebarCollapsed: false,
        settingsOpen: false,
        darkMode: false,
        fontFamily: 'Inter',
        colors: {
            primary: '#3b82f6',
            background: '#fff',
            cardBg: '#f5f5f5ff',
            text: '#1a1a1a',
            textSecondary: '#6b7280',
            border: '#e5e7eb',
            boxShadow: 'rgba(75, 70, 92, 0.19)'
        },
        defaultColors: {
            light: {
                primary: '#3b82f6',
                background: '#fff',
                cardBg: '#f5f5f5ff',
                text: '#1a1a1a',
                textSecondary: '#6b7280',
                border: '#e5e7eb',
                boxShadow: 'rgba(75, 70, 92, 0.19)'
            },
            dark: {
                primary: '#3b82f6',
                background: '#0a0a0a',
                cardBg: '#171717',
                text: '#ffffff',
                textSecondary: '#9ca3af',
                border: '#0f0f0f',
                boxShadow: '#08070755'
            }
        },
        get bodyStyles() {
            return {
                background: this.colors.background,
                fontFamily: this.fontFamily
            };
        },

        // 🟢 Alpine hook para inicializar DragGrid
        init() {
            this.grid = new DragGrid('#grid-js', {
                columns: 12,
                rowHeight: 60,
                margin: 5,
                draggable: true,
                resizable: true,
                removable: true,
                animate: true,
                swappable: true,
                colors: this.colors // pasamos los colores iniciales
            });

            // Helpers para el contenido
            const setContent = (tags, text) => {
                let chips = tags.map(t =>
                    `<span style="background:${t.color};color:white;padding:2px 6px;border-radius:4px;margin-right:4px;">${t.text}</span>`
                ).join('');
                return `<div>${chips}<p>${text}</p></div>`;
            };

            const setTile = (title) => {
                return `<h3 style="font-weight:bold;">${title}</h3>`;
            };

            // Widgets iniciales
            const initialWidgets = [
                { id: 1,  x: 0,  y: 0,  width: 2, height: 2,  
                  content: setContent([
                      { color: 'orange', text: 'Marketing' },
                      { color: 'indigo', text: 'External' }
                  ], 'Plan marketing campaign'),
                  title: setTile('Upcoming')
                },
                { id: 2,  x: 2,  y: 0,  width: 2, height: 3,  
                  content: setContent([
                      { color: 'purple', text: 'Production' },
                      { color: 'indigo', text: 'External' }
                  ], 'Create 10 T-shirt options for launch day'),
                  title: setTile('In progress')
                },
                { id: 3,  x: 4,  y: 0,  width: 2, height: 2,  
                  content: setContent([{ color: 'blue', text: 'Sales' }], 'Update online shop'),
                  title: setTile('Done')
                },
                { id: 4,  x: 2,  y: 3,  width: 2, height: 3,  
                  content: setContent([{ color: 'green', text: 'Legal' }], 'Approve legal agreement'),
                  title: setTile('Upcoming')
                },
                { id: 5,  x: 0,  y: 2,  width: 2, height: 4,  
                  content: setContent([
                      { color: 'red', text: 'Finance' },
                      { color: 'yellow', text: 'Review' }
                  ], 'Prepare Q2 budget report'),
                  title: setTile('Review')
                },
                { id: 6,  x: 6,  y: 0,  width: 3, height: 4,  
                  content: setContent([{ color: 'pink', text: 'Design' }], 'Sketch new homepage layout'),
                  title: setTile('In progress')
                },
                { id: 7,  x: 9,  y: 4,  width: 3, height: 2,  
                  content: setContent([
                      { color: 'blue', text: 'Sales' },
                      { color: 'green', text: 'Client' }
                  ], 'Follow up with top clients'),
                  title: setTile('Upcoming')
                },
                { id: 8,  x: 4,  y: 2,  width: 2, height: 5,  
                  content: setContent([
                      { color: 'indigo', text: 'External' },
                      { color: 'purple', text: 'Production' }
                  ], 'Arrange supplier contracts'),
                  title: setTile('Pending')
                },
                { id: 9,  x: 6,  y: 4,  width: 3, height: 3,  
                  content: setContent([{ color: 'orange', text: 'Marketing' }], 'Plan social media calendar'),
                  title: setTile('Done')
                },
                { id: 10, x: 9,  y: 0,  width: 3, height: 4,  
                  content: setContent([{ color: 'gray', text: 'Admin' }], 'Clean up old database records'),
                  title: setTile('Cleanup')
                },
            ];

            // Cargar widgets al grid
            initialWidgets.forEach(widget => {
                this.grid.addWidget({
                    id: widget.id,
                    x: widget.x,
                    y: widget.y,
                    width: widget.width,
                    height: widget.height,
                    title: widget.title,
                    content: widget.content
                });
            });
        },

        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            this.colors = { ...this.defaultColors[this.darkMode ? 'dark' : 'light'] };

            // actualizar DragGrid si soporta setColors
            if (this.grid) {
                this.grid.setColors?.(this.colors);
            }
        },

        updateColor(key, value) {
            this.colors[key] = value;
            if (this.grid) {
                this.grid.setColors?.(this.colors);
            }
        },

        updateFont(font) {
            this.fontFamily = font;
        },

        resetColors() {
            this.colors = { ...this.defaultColors[this.darkMode ? 'dark' : 'light'] };
            this.fontFamily = 'Inter';
            if (this.grid) {
                this.grid.setColors?.(this.colors);
            }
        }
    };
}
