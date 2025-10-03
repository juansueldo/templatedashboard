# Estadísticas

Los endpoints del módulo **Statistics** permiten obtener información y métricas relacionadas con los mensajes, seats y casos de la plataforma.

Base URL: `https://apit.xtz.mobi/v1/statistics/`

---

### cURL
```bash
curl -X POST "https://apit.xtz.mobi/v1/calendar/list"   
-H "Content-Type: application/json"   
-H "Xtz-Token: TU_TOKEN_GENERADO"   
-d '{"limit": 5}'
```

### JavaScript (fetch)
```javascript
fetch("https://apit.xtz.mobi/v1/calendar/list", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Xtz-Token": "TU_TOKEN_GENERADO"
  },
  body: JSON.stringify({ limit: 5 })
})
.then(res => res.json())
.then(data => console.log(data));
```


## Autenticación

Todos los métodos requieren un token válido.  
Se verifican permisos según la acción (`r` para lectura, `w` para escritura).

---

## Endpoints

### 1. Obtiene las estadísticas de los mensajes mediante los IDs de las instancias y los seatids.

**Ruta:** `POST /statistics/messages`  

**Permiso:** `r`  

**Parámetros:**

| Nombre      | Tipo   | Obligatorio | Descripción |
|-------------|--------|-------------|-------------|
| seatids     | array  | Sí          | ID de los seats a consultar |
| instanceids | array  | Sí          | ID de las instancias a consultar |
| datefrom    | date   | No          | Fecha de inicio para consultar las estadísticas |
| dateuntil   | date   | No          | Fecha de fin para consultar las estadísticas |

**Ejemplo Request:**
```json
{
  "seatids": ["31"],
  "instanceids":["212","218"],
  "datefrom": "2025-09-22",
  "dateuntil": "2025-09-26"
}
```

**Ejemplo Response:**
```json
{
  "status": "success",
  "data": {
    "openchats": 10,
    "unassignedchats": 3,
    "assignedunansweredchats": [...],
    "firstmessagesbyhours": [...],
    "firstmessagesbydayofweek": [...]
  }
}
```

---

### 2. Obtiene el promedio de respuesta por un seat, con la posibilidad de filtrar desde una fecha específica.

**Ruta:** `POST /statistics/averangeresponse`  

**Permiso:** `r`  

**Parámetros:**

| Nombre   | Tipo | Obligatorio | Descripción |
|----------|------|-------------|-------------|
| seatid   | int  | Sí          | ID del seat a consultar |
| datefrom | date | No          | Fecha de inicio para consultar las estadísticas |

**Ejemplo Request:**
```json
{
  "seatid": "31",
  "datefrom": "2025-09-22"
}
```

**Ejemplo Response:**
```json
{
  "status": "success",
  "data": {
    "averageresponse": "00:15:23"
  }
}
```

---

### 3. Obtiene estadísticas de mensajes de un seat en un rango de fechas opcional.

**Ruta:** `POST /statistics/messageseat`  

**Permiso:** `r`  

**Parámetros:**

| Nombre    | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| seatid    | int  | Sí          | ID del seat a consultar |
| datefrom  | date | No          | Fecha de inicio para consultar las estadísticas |
| dateuntil | date | No          | Fecha de fin para consultar las estadísticas |

**Ejemplo Request:**
```json
{
  "seatid": "31",
  "datefrom": "2025-09-22",
  "dateuntil": "2025-09-26"
}
```

**Ejemplo Response:**
```json
{
  "status": "success",
  "data": {
    "total": 12,
    "received": 4,
    "sent": 8
  }
}
```

---

### 4. Obtiene los **status** de un seat específico.

**Ruta:** `POST /statistics/statusseat`  

**Permiso:** `r`  

**Parámetros:**

| Nombre | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| seatid | int  | Sí          | ID del seat a consultar |

**Ejemplo Request:**
```json
{
  "seatid": "31"
}
```

**Ejemplo Response:**
```json
{
  "status": "success",
  "data": {
    "statusdatestart": "2025-09-30 12:58:13",
    "offline": false,
    "laststatus": {
      "start": "2025-09-30 12:58:13",
      "end": null,
      "state": "AVAILABLE"
    }
  }
}
```

---

### 5. Obtiene todas las estadísticas posibles de un seat en un rango de fechas opcional.

**Ruta:** `POST /statistics/all`  

**Permiso:** `r`  

**Parámetros:**

| Nombre    | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| seatid    | int  | Sí          | ID del seat a consultar |
| datefrom  | date | No          | Fecha de inicio para consultar las estadísticas |
| dateuntil | date | No          | Fecha de fin para consultar las estadísticas |

**Ejemplo Request**
```json
{
  "seatid": "31",
  "datefrom": "2025-09-22",
  "dateuntil": "2025-09-26"
}
```

**Ejemplo Response**
```json
{
  "status": "success",
  "data": {
    "status": {...},
    "messages": {...},
    "averange": {...}
  }
}
```

---

### 6. Obtiene estadísticas de casos abiertos agrupados por fecha u horario determinado.

**Ruta:** `POST /statistics/casesopened`  

**Permiso:** `r`  

**Parámetros:**

| Nombre    | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| datefrom  | date | Sí          | Fecha de inicio para la búsqueda |
| dateuntil | date | No          | Fecha de fin para la búsqueda |

**Ejemplo Request**
```json
{
  "datefrom": "2025-09-22",
  "dateuntil": "2025-09-26"
}
```

**Ejemplo Response**
```json
{
  "status": "success",
  "data": [
    {
      "date": "11:00",
      "count": 1,
      "instance": "hello@tomatina.cloud"
    },
    {
      "date": "14:00",
      "count": 1,
      "instance": "hello@tomatina.cloud"
    },
    {
      "date": "19:00",
      "count": 1,
      "instance": "tomatinacloud@gmail.com"
    },
    {
      "date": "20:00",
      "count": 3,
      "instance": "hello@tomatina.cloud"
    },
    {
      "date": "21:00",
      "count": 1,
      "instance": "tomatinacloud@gmail.com"
    }
  ]
}
```

---

### 7. Obtiene la evolución de casos (abiertos, cerrados y totales) en un rango de fechas.

**Ruta:** `POST /statistics/casesevolution`  

**Permiso:** `r`  

**Parámetros:**

| Nombre    | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| datefrom  | date | Sí          | Fecha de inicio para la búsqueda |
| dateuntil | date | No          | Fecha de fin para la búsqueda |

**Ejemplo Request**
```json
{
  "datefrom": "2025-09-22",
  "dateuntil": "2025-09-26"
}
```

**Ejemplo Response**
```json
{
  "status": "success",
  "data": [
    {
      "date": "01:00",
      "total": 1,
      "opened": 1,
      "closed": 0
    },
    {
      "date": "02:00",
      "total": 1,
      "opened": 0,
      "closed": 1
    },
    {
      "date": "03:00",
      "total": 1,
      "opened": 1,
      "closed": 0
    },
    {
      "date": "11:00",
      "total": 5,
      "opened": 4,
      "closed": 1
    }
  ]
}
```

---

### 8. Obtiene estadísticas generales de emails: mensajes sin leer, casos abiertos sin cerrar y mensajes sin responder.

**Ruta:** `POST /statistics/email`  

**Permiso:** `r`  

**Parámetros:**

| Nombre | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| seatid | int  | No          | Filtra por los casos de un determinado seat |

**Ejemplo Request**
```json
{
  "seatid": 31
}
```

**Ejemplo Response**
```json
{
  "status": "success",
  "data": {
    "unreadMessages": 5,
    "openCases": 3,
    "unansweredMessages": 2
  }
}
```
