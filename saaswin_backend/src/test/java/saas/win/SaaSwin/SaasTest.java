package saas.win.SaaSwin;

import net.bytebuddy.implementation.bind.MethodDelegationBinder;

public class SaasTest {
    public static void main(String[] args) {
        PersonDTO person1 = new PersonDTO("John", 25);
        System.out.println(person1.getName());

        PersonDTO person2 = updatePerson(person1);
        System.out.println(person1.getName());
        System.out.println(person2.getName());

        PersonDTO person3 = person1;
        person3.setName("Sujan");
        System.out.println(person1.getName());
        System.out.println(person3.getName());
    }
    public static PersonDTO updatePerson(PersonDTO personDTO) {
        // 객체의 name과 age 속성 수정
        personDTO.setName("Alice");
        personDTO.setAge(30);
        return personDTO;
    }

    public static int updatePerson(int a) {
        // 객체의 name과 age 속성 수정
        int result = a + 2;
        return result;
    }

}

