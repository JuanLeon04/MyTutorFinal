package uis.mytutor.servicio.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import uis.mytutor.modelo.Horario;
import uis.mytutor.modelo.Reserva;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HorarioSchedulerServicio {

    @Autowired
    private MongoTemplate mongoTemplate;

    // Servicio que revisa cada hora si un horario de tutoría ya paso
    // si este no fue resevado por nadie y está diponible
    // lo marca como no disponible para evitar errores
    @Scheduled(fixedRate = 3600000)
    public void actualizarHorariosExpirados() {

        Query query = new Query(
                Criteria.where("disponible").is(true)
                        .and("fechaInicio").lt(LocalDateTime.now())
        );

        Update update = new Update().set("disponible", false);

        mongoTemplate.updateMulti(query, update, Horario.class);
        System.out.println("Se actualizaron horarios no reservados");
    }


    // Servicio que verifica cada hora las resevas hechas
    // si una reserva ya pasó y está marcada como pendiente
    // se asigna ESPERANDO_ACCION_TUTOR para que el tutor sepa que necesita marcar ASISTIO NO_ASISTIO
    @Scheduled(fixedRate = 3600000)
    public void actualizarReservasPendientes() {

        LocalDateTime ahora = LocalDateTime.now();

        // Criterios unidos correctamente
        Criteria criteria = new Criteria().andOperator(
                Criteria.where("fechaFin").lt(ahora),
                Criteria.where("historialReservas").ne(null),
                Criteria.where("historialReservas.0").exists(true) // lista NO vacía
        );

        Query query = new Query(criteria);

        List<Horario> horarios = mongoTemplate.find(query, Horario.class);

        for (Horario horario : horarios) {

            boolean actualizado = false;

            if (horario.getHistorialReservas() != null) {
                for (Reserva r : horario.getHistorialReservas()) {
                    if (r.getEstado() == Reserva.EstadoReserva.PENDIENTE) {
                        r.setEstado(Reserva.EstadoReserva.ESPERANDO_ACCION_TUTOR);
                        actualizado = true;
                    }
                }
            }

            // 3. Si se actualizó al menos una reserva → guardar horario
            if (actualizado) {
                mongoTemplate.save(horario);
                System.out.println("Se actualizaron reservas pendientes pasadas a ESPERANDO_ACCION_TUTOR");
            }
        }
    }
}
