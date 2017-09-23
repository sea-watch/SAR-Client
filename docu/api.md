## API

* Version Prefix (backward compatibility) 

---

	Case (/api/v1/cases)
		GET -> (/?since_when={date-time}) -> get all cases that changed since given date
		GET -> (/{case_uuid}) -> Retrieves case
		POST -> (/{case_uuid}) -> Updates case (open question: conflict resolution)
		PUT (/) -> creates a new case and returns UUID
	
	Vehicle (/api/v1/vehicles)
		GET -> (/?since_when={date-time}) -> get all vehicles that changed since given date
		GET -> (/{vehicle_uuid}) -> Retrieves all relevant (to be defined) information for this vehicle
		
	Vehicle position (/api/v1/vehicles/{vehicle_uuid}/position)
		POST -> updates vehicle position if user is authorized
