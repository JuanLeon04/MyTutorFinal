package uis.mytutor.repositorio;

import org.springframework.data.mongodb.repository.MongoRepository;
import uis.mytutor.modelo.Usuario;

import java.util.Optional;

public interface UsuarioRepositorio extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    boolean existsByNombreUsuario(String nombreUsuario);
}
