package uis.mytutor.servicio.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uis.mytutor.modelo.Horario;
import uis.mytutor.modelo.Reserva;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.repositorio.HorarioRepositorio;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaServicio {

    @Autowired
    HorarioRepositorio horarioRepositorio;

    // Obtener todas las reservas
    // Devuelve todos los horarios con historialReservas != null
    public List<Horario> getReservas() {
        // Traer todos los horarios
        List<Horario> horarios = horarioRepositorio.findAll();

        // Filtrar solo los que tengan historialReservas con elementos
        return horarios.stream()
                .filter(h -> h.getHistorialReservas() != null && !h.getHistorialReservas().isEmpty())
                .collect(Collectors.toList());
    }


    // Que un usuario obtenga todas sus reservas
    // Obtiene todos los horarios donde él salga en la reserva
    public List<Horario> ObtenerMisReservas(Usuario usuarioQueSolicita) {

        String idUsuario = usuarioQueSolicita.getId();

        // Traer todos los horarios
        List<Horario> horarios = horarioRepositorio.findAll();

        // Filtrar horarios donde alguna reserva tenga el id del usuario
        return horarios.stream()
                .filter(horario -> horario.getHistorialReservas() != null)
                .filter(horario -> horario.getHistorialReservas().stream()
                        .anyMatch(reserva -> reserva.getIdUsuario().equals(idUsuario)))
                .collect(Collectors.toList());
    }


    // Que un usuario (Tanto rol ESTUDIANTE como TUTOR) reserve un horario de tutoría
    // Poner en horario disponible=false
    // EstadoReserva.PENDIENTE se asigna automáticamente en modelo
    // LocalDateTime.now() debe ser menor que fechaInicio en 2 horas (No se puede reservar un horario que ya pasó)
    public Reserva reservarHorario(Usuario usuarioQueSolicita, String idHorario) {
        // 1. Buscar el horario
        Horario horario = horarioRepositorio.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        // 2. Validar que el horario esté disponible
        if (!horario.isDisponible()) {
            throw new RuntimeException("Este horario ya no está disponible");
        }

        // 3. Validar que la fecha del horario sea al menos 2 horas mayor que ahora
        LocalDateTime ahora = LocalDateTime.now();
        if (ahora.isAfter(horario.getFechaInicio().minusHours(2))) {
            throw new RuntimeException("Solo puedes reservar un horario con mínimo 2 horas de anticipación");
        }

        // 4. Crear reserva
        Reserva nuevaReserva = new Reserva();
        nuevaReserva.setIdUsuario(usuarioQueSolicita.getId());
        // estado = PENDIENTE ya se asigna automáticamente
        // nuevaReserva.setFecha(LocalDateTime.now());

        // 5. Asegurar que la lista historialReservas no sea null
        if (horario.getHistorialReservas() == null) {
            horario.setHistorialReservas(new ArrayList<>());
        }

        // 6. Agregar la reserva al historial
        horario.getHistorialReservas().add(nuevaReserva);

        // 7. Marcar horario como NO disponible
        horario.setDisponible(false);

        // 8. Guardar cambios en Mongo
        horarioRepositorio.save(horario);

        return nuevaReserva;
    }


    // Que el tutor cancele una reserva que alguien le hizo
    // Solo puede cancelar un día antes
    //      -- LocalDateTime.now() debe ser un día antes a LocalDateTime fechaInicio en Horario)
    // Poner en horario disponible=false y la última reserva en EstadoReserva.CANCELADA
    public Reserva tutorCancelaReservaHecha(Usuario usuarioQueSolicita, String idHorario) {

        // 1. Validar que quien solicita sea tutor
        if (usuarioQueSolicita.getRol() != Usuario.Rol.TUTOR || usuarioQueSolicita.getTutor() == null) {
            throw new RuntimeException("Solo un tutor puede cancelar reservas realizadas por estudiantes.");
        }

        // 2. Buscar el horario que se quiere cancelar
        Horario horario = horarioRepositorio.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado."));

        // 3. Verificar que el horario pertenece al tutor solicitante
        if (!horario.getIdTutor().equals(usuarioQueSolicita.getId())) {
            throw new RuntimeException("No puedes cancelar reservas de un horario que no te pertenece.");
        }

        // 4. Verificar que el horario tenga reservas
        if (horario.getHistorialReservas() == null || horario.getHistorialReservas().isEmpty()) {
            throw new RuntimeException("Este horario no tiene reservas para cancelar.");
        }

        // 5. Tomar la última reserva (la activa)
        Reserva reservaActual = horario.getHistorialReservas()
                .get(horario.getHistorialReservas().size() - 1);

        // 6. Validar que la reserva esté en estado PENDIENTE
        if (reservaActual.getEstado() != Reserva.EstadoReserva.PENDIENTE) {
            throw new RuntimeException("Solo se pueden cancelar reservas que están en estado PENDIENTE.");
        }

        // 7. Validar que el tutor solo puede cancelar con 1 día de anticipación
        LocalDateTime ahora = LocalDateTime.now();
        if (ahora.isAfter(horario.getFechaInicio().minusDays(1))) {
            throw new RuntimeException("Solo puedes cancelar una reserva con al menos 1 día de anticipación.");
        }

        // 8. Cambiar el estado de la reserva
        reservaActual.setEstado(Reserva.EstadoReserva.CANCELADA);
        reservaActual.setFecha(LocalDateTime.now());

        // 9. Que ya no esté disponible
        horario.setDisponible(false);

        // 10. Guardar cambios en MongoDB
        horarioRepositorio.save(horario);

        return reservaActual;
    }



    // Que usuario (Tanto rol ESTUDIANTE como TUTOR) cancele una reserva que hizo (EstadoReserva.CANCELADA)
    // Solo puede cancelar un día antes
    //      -- LocalDateTime.now() debe ser un día antes a LocalDateTime fechaInicio en Horario)
    // Poner en horario disponible=true
    // Es posible que alguien la reserve despúes (Se añade la siguiente reserva disponible al array de historialReservas)
    public Reserva cancelarReserva(Usuario usuarioQueSolicita, String idHorario) {
        // 1. Buscar horario
        Horario horario = horarioRepositorio.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        if (horario.getHistorialReservas() == null || horario.getHistorialReservas().isEmpty()) {
            throw new RuntimeException("Este horario no tiene reservas");
        }

        // 2. Buscar la reserva activa (la última del historial)
        Reserva reservaActual = horario.getHistorialReservas()
                .get(horario.getHistorialReservas().size() - 1);

        // 3. Validar que la reserva pertenece al usuario solicitante
        if (!reservaActual.getIdUsuario().equals(usuarioQueSolicita.getId())) {
            throw new RuntimeException("No puedes cancelar una reserva que no hiciste");
        }

        // 4. Validar que falta al menos 1 día para el horario
        LocalDateTime ahora = LocalDateTime.now();
        if (ahora.isAfter(horario.getFechaInicio().minusDays(1))) {
            throw new RuntimeException("Solo puedes cancelar una reserva con al menos 1 día de anticipación");
        }

        // 5. Cambiar estado a CANCELADA
        reservaActual.setEstado(Reserva.EstadoReserva.CANCELADA);
        reservaActual.setFecha(LocalDateTime.now()); // Fecha de cancelación

        // 6. Hacer que el horario vuelva a estar disponible
        horario.setDisponible(true);

        // 7. Guardar cambios en MongoDB
        horarioRepositorio.save(horario);

        return reservaActual;
    }



    // Que el tutor marque la reserva como COMPLETADA
    // LocalDateTime.now() debe ser mayor que fechaFin de horario (Marcar solo las que ya hayan pasado)
    public Reserva reservaCompletada(Usuario usuarioQueSolicita, String idHorario) {
        // 1. Validar que el usuario es tutor
        if (usuarioQueSolicita.getRol() != Usuario.Rol.TUTOR) {
            throw new RuntimeException("Solo los tutores pueden marcar una reserva como completada");
        }

        // 2. Buscar el horario
        Horario horario = horarioRepositorio.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        // 3. Verificar que el tutor actual sea dueño del horario
        if (!horario.getIdTutor().equals(usuarioQueSolicita.getId())) {
            throw new RuntimeException("No puedes marcar reservas de otros tutores");
        }

        // 4. Validar que el horario ya terminó
        if (LocalDateTime.now().isBefore(horario.getFechaFin())) {
            throw new RuntimeException("No puedes marcar como completada una reserva que aún no ha terminado");
        }

        // 5. Obtener la última reserva (la que está activa)
        if (horario.getHistorialReservas() == null || horario.getHistorialReservas().isEmpty()) {
            throw new RuntimeException("Este horario no tiene reservas");
        }

        Reserva reservaActual = horario.getHistorialReservas()
                .get(horario.getHistorialReservas().size() - 1);

        // 6. Cambiar estado a COMPLETADA
        reservaActual.setEstado(Reserva.EstadoReserva.COMPLETADA);
        reservaActual.setFecha(LocalDateTime.now()); // Fecha en que se completó

        // 7. Guardar cambios
        horarioRepositorio.save(horario);

        return reservaActual;
    }



    // Que el tutor marque la reserva como NO_ASISTIO
    // LocalDateTime.now() debe ser mayor que fechaFin de horario (Marcar solo las que ya hayan pasado)
    public Reserva noAsistioALaReserva(Usuario usuarioQueSolicita,  String idHorario) {
        // 1. Validar que el usuario es tutor
        if (usuarioQueSolicita.getRol() != Usuario.Rol.TUTOR) {
            throw new RuntimeException("Solo los tutores pueden marcar una reserva como completada");
        }

        // 2. Buscar el horario
        Horario horario = horarioRepositorio.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        // 3. Verificar que el tutor actual sea dueño del horario
        if (!horario.getIdTutor().equals(usuarioQueSolicita.getId())) {
            throw new RuntimeException("No puedes marcar reservas de otros tutores");
        }

        // 4. Validar que el horario ya terminó
        if (LocalDateTime.now().isBefore(horario.getFechaFin())) {
            throw new RuntimeException("No puedes marcar como completada una reserva que aún no ha terminado");
        }

        // 5. Obtener la última reserva (la que está activa)
        if (horario.getHistorialReservas() == null || horario.getHistorialReservas().isEmpty()) {
            throw new RuntimeException("Este horario no tiene reservas");
        }

        Reserva reservaActual = horario.getHistorialReservas()
                .get(horario.getHistorialReservas().size() - 1);

        // 6. Cambiar estado a COMPLETADA
        reservaActual.setEstado(Reserva.EstadoReserva.NO_ASISTIO);
        reservaActual.setFecha(LocalDateTime.now()); // Fecha en que se completó

        // 7. Guardar cambios
        horarioRepositorio.save(horario);

        return reservaActual;
    }
}
