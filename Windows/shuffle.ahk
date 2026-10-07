Shuffle_Array(array_in) {
    ; Shuffle an array. Supports array of objects.

    If (Type(array_in) != "Array")
        Throw TypeError("Parameter should be of Array type." , -1, array_in)

    array_clone := array_in.Clone()  ; Let original array untouched.
    array_out := []

    Loop array_clone.Length {
        rand_index := Random(1, array_clone.Length)
        rand_item := array_clone[rand_index]
        array_clone.RemoveAt(rand_index)
        array_out.Push(rand_item)
    }

    Return array_out
}
