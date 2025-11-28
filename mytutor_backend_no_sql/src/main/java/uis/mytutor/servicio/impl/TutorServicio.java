package uis.mytutor.servicio.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uis.mytutor.dto.SolicitudTutor;
import uis.mytutor.modelo.Tutor;
import uis.mytutor.dto.TutorDTO;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.repositorio.UsuarioRepositorio;

import java.util.ArrayList;
import java.util.List;

@Service
public class TutorServicio {

    @Autowired
    UsuarioServicio usuarioServicio;

    @Autowired
    UsuarioRepositorio usuarioRepositorio;

    public static TutorDTO mapToTutorDTO(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        // Si no es tutor o si usuario.tutor está null → no puede mapearse
        if (usuario.getRol() != Usuario.Rol.TUTOR || usuario.getTutor() == null) {
            return null;
        }

        Tutor tutor = usuario.getTutor();

        TutorDTO dto = new TutorDTO();
        dto.setIdTutor(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setCorreo(usuario.getCorreo());
        dto.setTelefono(usuario.getTelefono());
        dto.setFotoPerfil(usuario.getFotoPerfil());

        dto.setBio(tutor.getBio());
        dto.setPrecioHora(tutor.getPrecioHora());
        dto.setExperiencia(tutor.getExperiencia());
        dto.setMaterias(tutor.getMaterias());
        dto.setResenas(tutor.getResenas());
        dto.setCalifiacionPromedio(tutor.getCalifiacionPromedio());

        return dto;
    }

    // Obtener todos los tutores
    public List<TutorDTO> getTutores() {
        return usuarioRepositorio.findAll()
                .stream()
                .map(TutorServicio::mapToTutorDTO) // convierte cada Usuario a TutorDTO si es tutor
                .toList();
    }

    // Que el propio usuario obtenga su información si es tutor tutor
    public SolicitudTutor getTutor(Usuario usuarioActual) {
        // Validar rol
        if (usuarioActual.getRol() != Usuario.Rol.TUTOR || usuarioActual.getTutor() == null) {
            throw new RuntimeException("Este usuario no es un tutor");
        }

        Tutor tutor = usuarioActual.getTutor();

        SolicitudTutor dto = new SolicitudTutor();
        dto.setBio(tutor.getBio());
        dto.setPrecioHora(tutor.getPrecioHora());
        dto.setExperiencia(tutor.getExperiencia());
        dto.setMaterias(tutor.getMaterias());

        return dto;
    }


    // Obtener la información del tutor por id del usuario
    public TutorDTO getTutorPorId(String idUsuario) {
        Usuario usuario = usuarioRepositorio.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getRol() != Usuario.Rol.TUTOR || usuario.getTutor() == null) {
            throw new RuntimeException("Este usuario no es un tutor");
        }
        return mapToTutorDTO(usuario);
    }



    // Que el propio usuario actualice su información si es tutor
    public SolicitudTutor ActualizarInfoTutorMismoUsuario(Usuario usuarioActual, SolicitudTutor nuevaInfo) {
        // Validar rol
        if (usuarioActual.getRol() != Usuario.Rol.TUTOR || usuarioActual.getTutor() == null) {
            return null;
        }

        Tutor tutor = usuarioActual.getTutor();

        // Actualizar campos
        tutor.setBio(nuevaInfo.getBio());
        tutor.setPrecioHora(nuevaInfo.getPrecioHora());
        tutor.setExperiencia(nuevaInfo.getExperiencia());
        tutor.setMaterias(nuevaInfo.getMaterias());

        usuarioRepositorio.save(usuarioActual);

        return nuevaInfo;
    }


    // Crear un tutor
    public Tutor crearTutor(SolicitudTutor solicitud, Usuario usuarioActual) {

        // 1. Validar que el usuario no sea ya tutor
        if (usuarioActual.getRol() == Usuario.Rol.TUTOR && usuarioActual.getTutor() != null) {
            throw new RuntimeException("El usuario ya es tutor.");
        }

        // 2. Crear el objeto Tutor
        Tutor tutor = new Tutor();
        tutor.setActivo(true);
        tutor.setBio(solicitud.getBio());
        tutor.setPrecioHora(solicitud.getPrecioHora());
        tutor.setExperiencia(solicitud.getExperiencia());
        tutor.setMaterias(solicitud.getMaterias());
        tutor.setResenas(new ArrayList<>()); // Un tutor nuevo no tiene reseñas

        // 3. Asignarlo al usuario
        usuarioActual.setTutor(tutor);
        usuarioActual.setRol(Usuario.Rol.TUTOR);

        // 4. Guardar en MongoDB
        usuarioRepositorio.save(usuarioActual);

        return tutor;
    }

    // Que el tutor se soft borre a si mismo
    public boolean tutorSeDesactivaElMismo(Usuario UsuarioQueSolicita) {
        if (UsuarioQueSolicita.getRol() == Usuario.Rol.TUTOR && UsuarioQueSolicita.getTutor() != null) {
            UsuarioQueSolicita.getTutor().setActivo(false);
            UsuarioQueSolicita.setRol(Usuario.Rol.ESTUDIANTE);
            usuarioRepositorio.save(UsuarioQueSolicita);
            return true;
        }
        return false;
    }

    // Soft borrar tutor por id
    public boolean desactivarTutorPorId(String idUsuarioTutor) {
        // 1. Buscar el usuario
        Usuario usuario = usuarioRepositorio.findById(idUsuarioTutor)
                .orElse(null);
        if (usuario == null) {
            return false; // No existe
        }
        // 2. Validar que sea tutor
        if (usuario.getRol() != Usuario.Rol.TUTOR || usuario.getTutor() == null) {
            return false; // No es tutor, no se puede desactivar
        }
        // 3. Realizar soft delete del tutor
        usuario.getTutor().setActivo(false);
        usuario.setRol(Usuario.Rol.ESTUDIANTE);

        usuarioRepositorio.save(usuario);
        return true;
    }


}
