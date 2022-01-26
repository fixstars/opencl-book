# Notes

## _Chapter 1_

1: Created by author using specifications found on Intel's site.

2: Although no fully automatic parallelization compilers exist, semi-automatic parallelization compilers that requires directives are released by The Portland Group, Inc (PGI), and CAPS.

## _Chapter 2_

3: NVIDIA restricts the use the term "GPGPU computing" for general purpose GPU computing through the graphics API, and "GPU computing" for general purpose GPU computing using CUDA and OpenCL. However, this text will use the term "GPGPU computing" to mean any general general purpose GPU computation.

4: http://www.nvidia.com/object/cuda\_home\_new.html

5: The kernel can be executed without using the <<<>>> constructor, but this will require calls to multiple CUDA-specific library functions.

6: http://www.fixstars.com/en/ydl/enterprise/

7: The devices that can be used depend on the OpenCL implementation by that company. There are instances where the CPU can only be used for the runtime component, with the GPU considered the only OpenCL device, so the OpenCL implementation should be chosen based on the supported platform.

8: Some reasons for this requirement are

(1) Each processor on the device is often only capable of running small programs, due to limited accessible memory.

(2) Because of the limited memory, it is common for the device to not run an OS. This is actually beneficial, as it allows the processors to concentrate on just the computations.

9: At present, it is not possible to use an OpenCL compiler by one company, and an OpenCL runtime library by another company. This should be kept in mind when programming a platform with multiple devices from different chip vendors.

## _Chapter 4_

10: The flag passed in the 2nd argument only specifies how the kernel-side can access the memory space. If the "CL\_MEM\_READ\_ONLY" is specified, this only allows the kernel to read from the specified address space, and does not imply that the buffer would be created in the constant memory. Also, the host is only allowed access to either the global memory or the constant memory on the device.

11: Otherwise, each kernel would have to be compiled independently.

## _Chapter 5_

12: The OpenCL specification does not state that the local memory will correspond to the scratch-pad memory, but it is most probable that this would be the case. Also, for those experienced in CUDA, note that the OpenCL local memory does not correspond with the CUDA local memory, as it corresponds to the shared memory.

13: This used to be true for the original publication, but is no longer the case for NVIDIA GPUs. The Fermi architecture includes a hardware cache.

14: These functions are valid only up until OpenCL 1.1. OpenCL 1.2 uses clCreateImage instead (see Chapter 7).

## _Chapter 6_

15: The "mts.h" is not explained here, as one only need to know that three variables are declared with the names "mts128", "mts256", "mts512", each containing corresponding number of DC parameters.

## _Chapter 7_

16: A test created by Khronos Group to verify that the implementation meets the OpenCL 1.2 specification.

17: AMD allowed us to try their OpenCL implementation before public release.
